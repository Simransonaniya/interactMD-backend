import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CaseVersionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformMetrics() {
    const totalUsers = await this.prisma.user.count();
    const totalCases = await this.prisma.case.count();
    const totalSimulations = await this.prisma.simulationSession.count();
    const totalEvaluations = await this.prisma.clinicalEvaluation.count();

    const evaluations = await this.prisma.clinicalEvaluation.findMany({
      select: { overallScore: true, passStatus: true },
    });

    const avgScore =
      evaluations.length > 0
        ? Math.round(evaluations.reduce((a, b) => a + b.overallScore, 0) / evaluations.length)
        : 0;

    const passRate =
      evaluations.length > 0
        ? Math.round((evaluations.filter((e) => e.passStatus).length / evaluations.length) * 100)
        : 0;

    return {
      totalUsers,
      totalCases,
      totalSimulations,
      totalEvaluations,
      platformAverageScore: avgScore,
      platformPassRate: passRate,
    };
  }

  async createCaseVersion(caseId: string, versionData: any) {
    const clinicalCase = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    });

    if (!clinicalCase) {
      throw new NotFoundException(`Case '${caseId}' not found.`);
    }

    const latestVersionNumber = clinicalCase.versions[0]?.versionNumber || 0;
    const nextVersionNumber = latestVersionNumber + 1;

    return this.prisma.caseVersion.create({
      data: {
        caseId,
        versionNumber: nextVersionNumber,
        status: CaseVersionStatus.DRAFT,
        patientProfile: versionData.patientProfile || {},
        initialVitals: versionData.initialVitals || {},
        chiefComplaint: versionData.chiefComplaint || {},
        historyFacts: versionData.historyFacts || {},
        physicalFindings: versionData.physicalFindings || [],
        investigations: versionData.investigations || [],
        diagnosisOptions: versionData.diagnosisOptions || [],
        managementProtocols: versionData.managementProtocols || [],
        scoringRubric: versionData.scoringRubric || {},
        systemPromptTemplate: versionData.systemPromptTemplate || null,
      },
    });
  }
}
