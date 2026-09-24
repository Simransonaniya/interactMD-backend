import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrgType } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    return org;
  }

  async create(name: string, type: OrgType = OrgType.MEDICAL_SCHOOL) {
    return this.prisma.organization.create({
      data: { name, type },
    });
  }
}
