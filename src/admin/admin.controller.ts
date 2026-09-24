import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin & Case CMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDUCATOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get global platform analytics and system activity metrics' })
  @ApiResponse({ status: 200, description: 'Platform statistics returned.' })
  async getMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @Post('cases/:caseId/versions')
  @ApiOperation({ summary: 'Create a new draft version for an existing clinical scenario' })
  @ApiResponse({ status: 201, description: 'New draft version created.' })
  async createVersion(
    @Param('caseId') caseId: string,
    @Body() versionData: any,
  ) {
    return this.adminService.createCaseVersion(caseId, versionData);
  }
}
