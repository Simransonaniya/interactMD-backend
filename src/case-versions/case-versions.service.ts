import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CaseVersionStatus } from '@prisma/client';

@Injectable()
export class CaseVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCaseId(caseId: string) {
    return this.prisma.caseVersion.findMany({
      where: { caseId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async findById(versionId: string) {
    const version = await this.prisma.caseVersion.findUnique({
      where: { id: versionId },
      include: { case: true },
    });

    if (!version) {
      throw new NotFoundException(`Case version '${versionId}' not found.`);
    }

    return version;
  }

  async updateStatus(versionId: string, status: CaseVersionStatus) {
    const version = await this.findById(versionId);

    // Lifecycle validation rules
    const allowedTransitions: Record<CaseVersionStatus, CaseVersionStatus[]> = {
      [CaseVersionStatus.DRAFT]: [CaseVersionStatus.CLINICAL_REVIEW],
      [CaseVersionStatus.CLINICAL_REVIEW]: [CaseVersionStatus.TEST, CaseVersionStatus.DRAFT],
      [CaseVersionStatus.TEST]: [CaseVersionStatus.APPROVED, CaseVersionStatus.DRAFT],
      [CaseVersionStatus.APPROVED]: [CaseVersionStatus.PUBLISHED, CaseVersionStatus.DRAFT],
      [CaseVersionStatus.PUBLISHED]: [CaseVersionStatus.RETIRED],
      [CaseVersionStatus.RETIRED]: [],
    };

    const validNextStatuses = allowedTransitions[version.status] || [];
    if (!validNextStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition case version from '${version.status}' to '${status}'. Allowed: ${validNextStatuses.join(', ') || 'none'}`,
      );
    }

    return this.prisma.caseVersion.update({
      where: { id: versionId },
      data: { status },
    });
  }
}
