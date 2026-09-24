import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Educator & Cohort Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDUCATOR, UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('cohort')
  @ApiOperation({ summary: 'Retrieve institutional cohort analytics, average scores, and curriculum gaps' })
  @ApiResponse({ status: 200, description: 'Cohort analytics returned.' })
  async getCohortAnalytics() {
    return this.analyticsService.getCohortAnalytics();
  }
}
