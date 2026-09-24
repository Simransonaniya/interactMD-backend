import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    const sessionCount = await this.prisma.simulationSession.count({
      where: { userId },
    });
    const completedEvaluations = await this.prisma.clinicalEvaluation.findMany({
      where: { userId },
      select: {
        overallScore: true,
        passStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const avgScore =
      completedEvaluations.length > 0
        ? Math.round(
            completedEvaluations.reduce((acc, curr) => acc + curr.overallScore, 0) /
              completedEvaluations.length,
          )
        : 0;

    return {
      ...user,
      stats: {
        totalSimulationsStarted: sessionCount,
        completedEvaluationsCount: completedEvaluations.length,
        averageScore: avgScore,
        recentScores: completedEvaluations.map((e) => ({
          score: e.overallScore,
          passed: e.passStatus,
          date: e.createdAt,
        })),
      },
    };
  }

  async updateRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }
}
