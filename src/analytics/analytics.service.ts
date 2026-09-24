import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCohortAnalytics() {
    const cases = await this.prisma.case.findMany({
      include: {
        evaluations: {
          select: {
            overallScore: true,
            passStatus: true,
            criticalActionsMissed: true,
          },
        },
      },
    });

    const casePerformance = cases.map((c) => {
      const evals = c.evaluations;
      const count = evals.length;
      const avg = count > 0 ? Math.round(evals.reduce((a, b) => a + b.overallScore, 0) / count) : 0;
      const passRate = count > 0 ? Math.round((evals.filter((e) => e.passStatus).length / count) * 100) : 0;

      // Flatten missed critical actions
      const missedMap: Record<string, number> = {};
      evals.forEach((e) => {
        (e.criticalActionsMissed || []).forEach((action) => {
          missedMap[action] = (missedMap[action] || 0) + 1;
        });
      });

      const topMissedActions = Object.entries(missedMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([action, frequency]) => ({ action, frequency }));

      return {
        caseId: c.id,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty,
        totalAttempts: count,
        averageScore: avg,
        passRatePercentage: passRate,
        topMissedActions,
      };
    });

    const totalEvals = await this.prisma.clinicalEvaluation.count();
    const weaknesses = await this.prisma.learnerWeakness.findMany({
      orderBy: { frequency: 'desc' },
      take: 5,
    });

    return {
      totalEvaluationsAnalyzed: totalEvals,
      casePerformance,
      cohortTopGaps: weaknesses.map((w) => ({
        domain: w.domain,
        frequency: w.frequency,
      })),
    };
  }
}
