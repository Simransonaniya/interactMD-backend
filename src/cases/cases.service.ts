import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { CaseVersionStatus } from '@prisma/client';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCasesDto) {
    const { search, specialty, difficulty } = query;

    try {
      const where: any = {};

      if (specialty) {
        where.specialty = { equals: specialty, mode: 'insensitive' };
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { presentation: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ];
      }

      const cases = await this.prisma.case.findMany({
        where,
        include: {
          versions: {
            where: {
              status: { in: [CaseVersionStatus.PUBLISHED, CaseVersionStatus.APPROVED] },
            },
            orderBy: { versionNumber: 'desc' },
            take: 1,
            select: {
              id: true,
              versionNumber: true,
              status: true,
              patientProfile: true,
              initialVitals: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (cases.length > 0) {
        return cases.map((c) => {
          const activeVersion = c.versions[0];
          const patient = (activeVersion?.patientProfile as any) || {};
          return {
            id: c.id,
            slug: c.slug,
            title: c.title,
            specialty: c.specialty,
            difficulty: c.difficulty,
            presentation: c.presentation,
            estimatedMinutes: c.estimatedMinutes,
            tags: c.tags,
            learningObjectives: c.learningObjectives,
            activeVersionId: activeVersion?.id || null,
            patientName: patient.name || 'Simulated Patient',
            patientAge: patient.age || 50,
            patientGender: patient.gender || 'Unknown',
            patientAvatarUrl: patient.avatarUrl || null,
          };
        });
      }
    } catch (err) {
      this.logger.warn(`Database query failed; serving benchmark catalog: ${err.message}`);
    }

    // High-availability fallback to benchmark cases
    let filtered = [...BENCHMARK_CASES];
    if (specialty) {
      filtered = filtered.filter((c) => c.specialty.toLowerCase() === specialty.toLowerCase());
    }
    if (difficulty) {
      filtered = filtered.filter((c) => c.difficulty === difficulty);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.presentation.toLowerCase().includes(s) ||
          c.tags.some((t) => t.toLowerCase().includes(s)),
      );
    }

    return filtered.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      specialty: c.specialty,
      difficulty: c.difficulty,
      presentation: c.presentation,
      estimatedMinutes: c.estimatedMinutes,
      tags: c.tags,
      learningObjectives: c.learningObjectives,
      activeVersionId: `${c.id}-v1`,
      patientName: c.patientProfile.name,
      patientAge: c.patientProfile.age,
      patientGender: c.patientProfile.gender,
      patientAvatarUrl: c.patientProfile.avatarUrl,
    }));
  }

  async findOne(idOrSlug: string) {
    try {
      const clinicalCase = await this.prisma.case.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (clinicalCase) {
        const latestVersion = clinicalCase.versions[0];
        return {
          ...clinicalCase,
          activeVersion: latestVersion,
        };
      }
    } catch (err) {
      this.logger.warn(`Database findOne failed; searching benchmark cases: ${err.message}`);
    }

    const fallback = BENCHMARK_CASES.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (!fallback) {
      throw new NotFoundException(`Case '${idOrSlug}' not found.`);
    }

    return {
      id: fallback.id,
      slug: fallback.slug,
      title: fallback.title,
      specialty: fallback.specialty,
      difficulty: fallback.difficulty,
      presentation: fallback.presentation,
      estimatedMinutes: fallback.estimatedMinutes,
      tags: fallback.tags,
      learningObjectives: fallback.learningObjectives,
      activeVersion: {
        id: `${fallback.id}-v1`,
        caseId: fallback.id,
        versionNumber: 1,
        status: 'PUBLISHED',
        patientProfile: fallback.patientProfile,
        initialVitals: fallback.initialVitals,
        chiefComplaint: fallback.chiefComplaint,
        historyFacts: fallback.historyFacts,
        physicalFindings: fallback.physicalFindings,
        investigations: fallback.investigations,
        diagnosisOptions: fallback.diagnosisOptions,
        managementProtocols: fallback.managementProtocols,
        scoringRubric: fallback.scoringRubric,
      },
    };
  }

  async createCase(dto: CreateCaseDto, authorId: string) {
    return this.prisma.case.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        specialty: dto.specialty,
        difficulty: dto.difficulty,
        presentation: dto.presentation,
        estimatedMinutes: dto.estimatedMinutes || 15,
        tags: dto.tags || [],
        learningObjectives: dto.learningObjectives || [],
        authorId,
      },
    });
  }
}
