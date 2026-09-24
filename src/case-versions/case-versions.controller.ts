import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CaseVersionsService } from './case-versions.service';
import { CaseVersionStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Case Versions & Lifecycle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('case-versions')
export class CaseVersionsController {
  constructor(private readonly caseVersionsService: CaseVersionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get full clinical data definition for a specific case version' })
  @ApiResponse({ status: 200, description: 'Version snapshot retrieved.' })
  async findOne(@Param('id') id: string) {
    return this.caseVersionsService.findById(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.EDUCATOR)
  @ApiOperation({ summary: 'Transition version status through approval lifecycle' })
  @ApiResponse({ status: 200, description: 'Version status successfully transitioned.' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CaseVersionStatus,
  ) {
    return this.caseVersionsService.updateStatus(id, status);
  }
}
