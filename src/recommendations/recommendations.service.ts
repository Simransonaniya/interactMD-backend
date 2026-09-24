import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(userId: string) {
    let weaknesses: any[] = [];
    let allCases: any[] = [];

    if (this.prisma.isAvailable) {
      try {
        weaknesses = await this.prisma.learnerWeakness.findMany({
          where: { userId },
          orderBy: { frequency: 'desc' },
          take: 5,
        });

        allCases = await this.prisma.case.findMany({
          select: {
            id: true,
            slug: true,
            title: true,
            specialty: true,
            difficulty: true,
            presentation: true,
            tags: true,
          },
          take: 4,
        });
      } catch {
        // Fallback
      }
    }

    if (allCases.length === 0) {
      allCases = BENCHMARK_CASES.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty,
        presentation: c.presentation,
        tags: c.tags,
      }));
    }

    const recommendations = weaknesses.map((w) => ({
      domain: w.domain,
      frequency: w.frequency,
      remediationFocus: `Practice scenarios focusing on ${w.domain}`,
      suggestedCases: allCases.map((c) => ({
        caseId: c.id,
        slug: c.slug,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty,
        rationale: `Targeted remediation for ${w.domain}`,
      })),
    }));

    return {
      userId,
      identifiedWeaknesses: weaknesses,
      recommendations: recommendations.length > 0 ? recommendations : [
        {
          domain: 'Core Diagnostic Foundations',
          frequency: 0,
          remediationFocus: 'Continue mastering core emergency clinical scenarios',
          suggestedCases: allCases.map((c) => ({
            caseId: c.id,
            slug: c.slug,
            title: c.title,
            specialty: c.specialty,
            difficulty: c.difficulty,
            rationale: 'Benchmark OSCE case simulation',
          })),
        },
      ],
    };
  }
}
