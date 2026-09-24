import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatientProfileForCase(caseId: string) {
    const version = await this.prisma.caseVersion.findFirst({
      where: { caseId },
      orderBy: { versionNumber: 'desc' },
      select: {
        patientProfile: true,
        initialVitals: true,
        chiefComplaint: true,
      },
    });

    if (!version) {
      throw new NotFoundException(`No patient profile found for case '${caseId}'.`);
    }

    return {
      profile: version.patientProfile,
      vitals: version.initialVitals,
      complaint: version.chiefComplaint,
    };
  }
}
