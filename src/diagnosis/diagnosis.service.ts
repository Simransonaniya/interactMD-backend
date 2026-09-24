import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubmitDiagnosisDto, SubmitManagementDto } from './dto/submit-diagnosis.dto';
import { EventType, SessionStage } from '@prisma/client';
import { MEMORY_SESSIONS } from '../simulation/session-store';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';

@Injectable()
export class DiagnosisService {
  constructor(private readonly prisma: PrismaService) {}

  async submitDiagnosis(sessionId: string, dto: SubmitDiagnosisDto) {
    let session: any = null;

    if (this.prisma.isAvailable) {
      try {
        session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: { caseVersion: true },
        });
      } catch {
        // Fallback
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (!session && !memSession) {
      throw new NotFoundException(`Simulation session '${sessionId}' not found.`);
    }

    const caseVersion = session?.caseVersion || memSession?.caseVersion || BENCHMARK_CASES[0];
    const diagnosisOptions = (caseVersion.diagnosisOptions as any[]) || [];
    const targetDx = diagnosisOptions.find(
      (d) =>
        d.id?.toLowerCase() === dto.mostLikelyDiagnosisId.toLowerCase() ||
        d.id?.toLowerCase().includes(dto.mostLikelyDiagnosisId.toLowerCase()),
    );

    if (!targetDx) {
      throw new BadRequestException(
        `Selected diagnosis '${dto.mostLikelyDiagnosisId}' is not among candidate options for this case.`,
      );
    }

    // Record interaction events
    if (session) {
      try {
        await this.prisma.interactionEvent.create({
          data: {
            sessionId,
            type: EventType.DIFFERENTIAL_SUBMITTED,
            name: 'DIFFERENTIAL_DIAGNOSES',
            payload: { differentialIds: dto.differentialDiagnosisIds },
          },
        });

        await this.prisma.interactionEvent.create({
          data: {
            sessionId,
            type: EventType.DIAGNOSIS_SUBMITTED,
            name: 'PRIMARY_DIAGNOSIS',
            payload: {
              primaryId: dto.mostLikelyDiagnosisId,
              primaryName: targetDx.name,
              isCorrectPrimary: targetDx.isCorrectPrimary || false,
              rationale: dto.clinicalRationale,
            },
          },
        });

        await this.prisma.simulationSession.update({
          where: { id: sessionId },
          data: { currentStage: SessionStage.MANAGEMENT },
        });
      } catch {
        // Fallback
      }
    }

    if (memSession) {
      memSession.currentStage = SessionStage.MANAGEMENT;
      memSession.events.push({
        type: EventType.DIFFERENTIAL_SUBMITTED,
        name: 'DIFFERENTIAL_DIAGNOSES',
        payload: { differentialIds: dto.differentialDiagnosisIds },
        timestamp: new Date().toISOString(),
      });
      memSession.events.push({
        type: EventType.DIAGNOSIS_SUBMITTED,
        name: 'PRIMARY_DIAGNOSIS',
        payload: {
          primaryId: dto.mostLikelyDiagnosisId,
          primaryName: targetDx.name,
          isCorrectPrimary: targetDx.isCorrectPrimary || false,
          rationale: dto.clinicalRationale,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      sessionId,
      stage: SessionStage.MANAGEMENT,
      primarySubmitted: targetDx.name,
      differentialCount: dto.differentialDiagnosisIds.length,
      status: 'recorded',
    };
  }

  async submitManagement(sessionId: string, dto: SubmitManagementDto) {
    let session: any = null;

    if (this.prisma.isAvailable) {
      try {
        session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: { caseVersion: true },
        });
      } catch {
        // Fallback
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (!session && !memSession) {
      throw new NotFoundException(`Simulation session '${sessionId}' not found.`);
    }

    if (session) {
      try {
        await this.prisma.interactionEvent.create({
          data: {
            sessionId,
            type: EventType.MANAGEMENT_SUBMITTED,
            name: 'MANAGEMENT_INTERVENTIONS',
            payload: {
              managementIds: dto.selectedManagementIds,
            },
          },
        });

        await this.prisma.simulationSession.update({
          where: { id: sessionId },
          data: { currentStage: SessionStage.EVALUATION },
        });
      } catch {
        // Fallback
      }
    }

    if (memSession) {
      memSession.currentStage = SessionStage.EVALUATION;
      memSession.events.push({
        type: EventType.MANAGEMENT_SUBMITTED,
        name: 'MANAGEMENT_INTERVENTIONS',
        payload: {
          managementIds: dto.selectedManagementIds,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      sessionId,
      stage: SessionStage.EVALUATION,
      selectedCount: dto.selectedManagementIds.length,
      status: 'ready_for_evaluation',
    };
  }
}
