import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AIOrchestratorService } from '../ai/ai-orchestrator.service';
import { StartSessionDto } from './dto/start-session.dto';
import { PostMessageDto } from './dto/post-message.dto';
import { SessionStatus, SessionStage, MessageRole, EventType } from '@prisma/client';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';
import { MEMORY_SESSIONS } from './session-store';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiOrchestrator: AIOrchestratorService,
  ) {}

  async startSession(userId: string, dto: StartSessionDto) {
    if (this.prisma.isAvailable) {
      try {
        const clinicalCase = await this.prisma.case.findFirst({
          where: {
            OR: [{ id: dto.caseId }, { slug: dto.caseId }],
          },
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        });

      if (clinicalCase && clinicalCase.versions.length > 0) {
        const version = dto.caseVersionId
          ? await this.prisma.caseVersion.findUnique({ where: { id: dto.caseVersionId } })
          : clinicalCase.versions[0];

        const existingActive = await this.prisma.simulationSession.findFirst({
          where: {
            userId,
            caseId: clinicalCase.id,
            status: SessionStatus.ACTIVE,
          },
          include: {
            messages: { orderBy: { timestamp: 'asc' } },
            events: true,
          },
        });

        if (existingActive) {
          return this.formatSessionResponse(existingActive, version);
        }

        const patientProfile = (version.patientProfile as any) || {};
        const initialStatement =
          patientProfile.initialStatement || "Doctor, please help me... I'm not feeling well.";

        const session = await this.prisma.simulationSession.create({
          data: {
            userId,
            caseId: clinicalCase.id,
            caseVersionId: version.id,
            status: SessionStatus.ACTIVE,
            currentStage: SessionStage.HISTORY,
            patientState: {
              painScore: (version.initialVitals as any)?.painScore || 8,
              mood: patientProfile.mood || 'Anxious',
            },
            messages: {
              create: {
                role: MessageRole.PATIENT,
                content: initialStatement,
                category: 'General',
              },
            },
          },
          include: {
            messages: true,
            events: true,
          },
        });

        return this.formatSessionResponse(session, version);
      }
    } catch (err) {
      this.logger.warn(`Database session creation deferred; using resilient memory session: ${err.message}`);
    }
  }

    // High-availability fallback to in-memory session
    const fallbackCase = BENCHMARK_CASES.find((c) => c.id === dto.caseId || c.slug === dto.caseId) || BENCHMARK_CASES[0];
    const sessionId = `sim-mem-${Date.now()}`;

    const memSession = {
      id: sessionId,
      userId,
      caseId: fallbackCase.id,
      caseVersionId: `${fallbackCase.id}-v1`,
      status: SessionStatus.ACTIVE,
      currentStage: SessionStage.HISTORY,
      startedAt: new Date(),
      durationSeconds: 0,
      caseVersion: {
        id: `${fallbackCase.id}-v1`,
        patientProfile: fallbackCase.patientProfile,
        initialVitals: fallbackCase.initialVitals,
        chiefComplaint: fallbackCase.chiefComplaint,
        historyFacts: fallbackCase.historyFacts,
        physicalFindings: fallbackCase.physicalFindings,
        investigations: fallbackCase.investigations,
        diagnosisOptions: fallbackCase.diagnosisOptions,
        managementProtocols: fallbackCase.managementProtocols,
        scoringRubric: fallbackCase.scoringRubric,
      },
      messages: [
        {
          id: `msg-pt-0`,
          role: 'patient',
          content: fallbackCase.patientProfile.initialStatement,
          category: 'General',
          empathyDetected: false,
          timestamp: new Date().toISOString(),
        },
      ],
      events: [],
    };

    MEMORY_SESSIONS.set(sessionId, memSession);
    return this.formatSessionResponse(memSession, memSession.caseVersion);
  }

  async getSession(sessionId: string, userId: string) {
    if (this.prisma.isAvailable) {
      try {
        const session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: {
            case: true,
            caseVersion: true,
            messages: { orderBy: { timestamp: 'asc' } },
            events: { orderBy: { timestamp: 'asc' } },
            evaluation: true,
          },
        });

        if (session) {
          return this.formatSessionResponse(session, session.caseVersion);
        }
      } catch {
        // Fall through to memory sessions
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (!memSession) {
      throw new NotFoundException(`Simulation session '${sessionId}' not found.`);
    }

    return this.formatSessionResponse(memSession, memSession.caseVersion);
  }

  async postMessage(sessionId: string, userId: string, dto: PostMessageDto) {
    let caseVersion: any = null;
    let messages: any[] = [];
    let isMemory = false;

    if (this.prisma.isAvailable) {
      try {
        const session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: {
            caseVersion: true,
            messages: { orderBy: { timestamp: 'asc' } },
          },
        });

        if (session) {
          caseVersion = session.caseVersion;
          messages = session.messages;

          await this.prisma.chatMessage.create({
            data: {
              sessionId,
              role: MessageRole.STUDENT,
              content: dto.message.trim(),
              category: 'General',
            },
          });
        }
      } catch {
        // Fall back to memory
      }
    }

    if (!caseVersion) {
      const memSession = MEMORY_SESSIONS.get(sessionId);
      if (!memSession) {
        throw new NotFoundException(`Session '${sessionId}' not found.`);
      }
      isMemory = true;
      caseVersion = memSession.caseVersion;
      messages = memSession.messages;

      memSession.messages.push({
        id: `msg-std-${Date.now()}`,
        role: 'student',
        content: dto.message.trim(),
        category: 'General',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Process dialogue turn via AI Orchestrator
    const conversationHistory = messages.map((m) => ({
      role: (m.role || '').toUpperCase(),
      content: m.content,
    }));

    const result = await this.aiOrchestrator.processLearnerTurn(
      caseVersion,
      dto.message,
      conversationHistory,
    );

    // 3. Save patient reply
    const patientMsgTimestamp = new Date().toISOString();
    let patientMsgId = `msg-pt-${Date.now()}`;

    if (!isMemory) {
      try {
        const saved = await this.prisma.chatMessage.create({
          data: {
            sessionId,
            role: MessageRole.PATIENT,
            content: result.reply,
            category: result.category,
            empathyDetected: result.empathyDetected,
          },
        });
        patientMsgId = saved.id;
      } catch {
        // Fallback ID
      }
    } else {
      const memSession = MEMORY_SESSIONS.get(sessionId);
      memSession.messages.push({
        id: patientMsgId,
        role: 'patient',
        content: result.reply,
        category: result.category,
        empathyDetected: result.empathyDetected,
        timestamp: patientMsgTimestamp,
      });
    }

    // Blueprint Section 9 compliant response
    return {
      sessionId,
      message: {
        id: patientMsgId,
        role: 'patient',
        content: result.reply,
        category: result.category,
        empathyDetected: result.empathyDetected,
        timestamp: patientMsgTimestamp,
      },
      stage: SessionStage.HISTORY,
      provider: result.provider,
      suggestedTopics: result.suggestedTopics,
      events: [
        {
          type: EventType.HISTORY_QUESTION,
          name: 'INQUIRY',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  private formatSessionResponse(session: any, version: any) {
    const p = (version?.patientProfile as any) || {};
    const v = (version?.initialVitals as any) || {};

    return {
      id: session.id,
      userId: session.userId,
      caseId: session.caseId,
      caseVersionId: session.caseVersionId,
      status: session.status,
      currentStage: session.currentStage,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      patientProfile: {
        name: p.name || 'Patient',
        age: p.age || 50,
        gender: p.gender || 'Unknown',
        avatarUrl: p.avatarUrl || null,
        occupation: p.occupation || 'Professional',
        presentationComplaint: p.presentationComplaint || '',
        mood: p.mood || 'Anxious',
        appearance: p.appearance || 'Pale',
      },
      initialVitals: v,
      messages: (session.messages || []).map((m: any) => ({
        id: m.id,
        role: (m.role || '').toLowerCase(),
        content: m.content,
        category: m.category,
        empathyDetected: m.empathyDetected || false,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      })),
      performedExamIds: (session.events || [])
        .filter((e: any) => e.type === EventType.EXAM_REQUEST)
        .map((e: any) => e.payload?.examId || e.name),
      orderedInvestigationIds: (session.events || [])
        .filter((e: any) => e.type === EventType.INVESTIGATION_REQUEST)
        .map((e: any) => e.payload?.testId || e.name),
    };
  }
}
