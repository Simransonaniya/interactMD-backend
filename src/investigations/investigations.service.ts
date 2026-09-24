import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventType } from '@prisma/client';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';
import { MEMORY_SESSIONS } from '../simulation/session-store';

@Injectable()
export class InvestigationsService {
  private readonly logger = new Logger(InvestigationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async performPhysicalExam(sessionId: string, system: string, examId?: string) {
    let findings: any[] = [];

    if (this.prisma.isAvailable) {
      try {
        const session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: { caseVersion: true },
        });

        if (session) {
          findings = (session.caseVersion.physicalFindings as any[]) || [];
          await this.prisma.interactionEvent.create({
            data: {
              sessionId,
              type: EventType.EXAM_REQUEST,
              name: `PHYSICAL_EXAM_${system.toUpperCase()}`,
              payload: { system, examId },
            },
          });
        }
      } catch {
        // Fallback
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (memSession) {
      findings = memSession.caseVersion?.physicalFindings || findings;
      memSession.events.push({
        type: EventType.EXAM_REQUEST,
        name: `PHYSICAL_EXAM_${system.toUpperCase()}`,
        payload: { system, examId },
        timestamp: new Date().toISOString(),
      });
    }

    if (findings.length === 0) {
      const bCase = BENCHMARK_CASES[0];
      findings = bCase.physicalFindings;
    }

    const matched = findings.filter((f) => {
      if (examId && f.id === examId) return true;
      if (system && f.system?.toLowerCase().includes(system.toLowerCase())) return true;
      return false;
    });

    if (matched.length === 0) {
      throw new BadRequestException(
        `Physical examination for system '${system}' / '${examId}' is not defined for this clinical case.`,
      );
    }

    return {
      system,
      findings: matched,
      status: 'completed',
    };
  }

  async orderInvestigation(sessionId: string, testNameOrId: string) {
    let investigations: any[] = [];

    if (this.prisma.isAvailable) {
      try {
        const session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: { caseVersion: true },
        });

        if (session) {
          investigations = (session.caseVersion.investigations as any[]) || [];
          await this.prisma.interactionEvent.create({
            data: {
              sessionId,
              type: EventType.INVESTIGATION_REQUEST,
              name: `ORDER_${testNameOrId}`,
              payload: { test: testNameOrId },
            },
          });
        }
      } catch {
        // Fallback
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (memSession) {
      investigations = memSession.caseVersion?.investigations || investigations;
      memSession.events.push({
        type: EventType.INVESTIGATION_REQUEST,
        name: `ORDER_${testNameOrId}`,
        payload: { test: testNameOrId },
        timestamp: new Date().toISOString(),
      });
    }

    if (investigations.length === 0) {
      investigations = BENCHMARK_CASES[0].investigations;
    }

    const searchLower = testNameOrId.toLowerCase();
    const matched = investigations.find(
      (inv) =>
        inv.id?.toLowerCase().includes(searchLower) ||
        inv.name?.toLowerCase().includes(searchLower),
    );

    if (!matched) {
      throw new BadRequestException(
        `Diagnostic test '${testNameOrId}' is not available or indicated for this case.`,
      );
    }

    return {
      test: matched.name,
      testId: matched.id,
      category: matched.category,
      turnaroundMinutes: matched.turnaroundMinutes || 15,
      status: 'completed',
      result: {
        value: matched.value || 'Reported',
        normalRange: matched.normalRange || null,
        interpretation: matched.interpretation,
        isAbnormal: matched.isAbnormal,
        imageUrl: matched.imageUrl || null,
        findingsDetail: matched.findingsDetail || [],
      },
    };
  }
}
