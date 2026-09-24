import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Learner Dashboard & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve full learner dashboard metrics, radar charts, and recent session history' })
  @ApiResponse({ status: 200, description: 'Learner dashboard metrics returned.' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getLearnerDashboard(userId);
  }
}
