import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MEMORY_SESSIONS } from '../simulation/session-store';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLearnerDashboard(userId: string) {
    let evaluations: any[] = [];
    let totalSessions = 0;

    if (this.prisma.isAvailable) {
      try {
        evaluations = await this.prisma.clinicalEvaluation.findMany({
          where: { userId },
          include: { case: true },
          orderBy: { createdAt: 'desc' },
        });

        totalSessions = await this.prisma.simulationSession.count({
          where: { userId },
        });
      } catch {
        // Fallback
      }
    }

    if (evaluations.length === 0) {
      Array.from(MEMORY_SESSIONS.values()).forEach((s) => {
        totalSessions++;
        if (s.evaluation) {
          evaluations.push({
            ...s.evaluation,
            case: {
              title: s.caseVersion?.patientProfile?.name
                ? `Clinical Case: ${s.caseVersion.patientProfile.name}`
                : 'Acute Coronary Syndrome',
              specialty: 'Cardiology',
            },
          });
        }
      });
    }

    const passedCount = evaluations.filter((e) => e.passStatus).length;
    const completedCount = evaluations.length;
    const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
    const averageScore =
      completedCount > 0
        ? Math.round(evaluations.reduce((a, b) => a + b.overallScore, 0) / completedCount)
        : 0;

    const totalSeconds = evaluations.reduce((a, b) => a + (b.durationSeconds || 600), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // Compute average radar scores across 5 OSCE dimensions
    let avgInterview = 75;
    let avgReasoning = 75;
    let avgComm = 80;
    let avgWorkup = 75;
    let avgMgmt = 75;

    if (completedCount > 0) {
      let sumInt = 0, sumReas = 0, sumComm = 0, sumWork = 0, sumMgmt = 0;
      evaluations.forEach((e) => {
        const d = (e.dimensionScores as any) || {};
        sumInt += d.interviewCompleteness?.score || 70;
        sumReas += d.clinicalReasoning?.score || 70;
        sumComm += d.communication?.score || 80;
        sumWork += d.diagnosticWorkup?.score || 70;
        sumMgmt += d.management?.score || 70;
      });
      avgInterview = Math.round(sumInt / completedCount);
      avgReasoning = Math.round(sumReas / completedCount);
      avgComm = Math.round(sumComm / completedCount);
      avgWorkup = Math.round(sumWork / completedCount);
      avgMgmt = Math.round(sumMgmt / completedCount);
    }

    const recentSessions = evaluations.slice(0, 5).map((e) => ({
      id: e.sessionId,
      caseTitle: e.case.title,
      specialty: e.case.specialty,
      score: e.overallScore,
      grade: e.overallGrade,
      passed: e.passStatus,
      completedAt: e.createdAt,
    }));

    return {
      overviewMetrics: {
        totalSimulationsStarted: totalSessions,
        totalCasesCompleted: completedCount,
        passRatePercentage: passRate,
        averageScore,
        totalHoursPracticed: totalHours,
      },
      competencyRadar: {
        interviewCompleteness: avgInterview,
        clinicalReasoning: avgReasoning,
        communicationAndEmpathy: avgComm,
        diagnosticWorkupSafety: avgWorkup,
        guidelineManagement: avgMgmt,
      },
      recentSessions,
    };
  }
}
