import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrgType, UserRole } from '@prisma/client';

@ApiTags('Organizations & Institutional Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all partner medical schools and residency programs' })
  @ApiResponse({ status: 200, description: 'List of institutions.' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institutional tenant details and cohort member count' })
  @ApiResponse({ status: 200, description: 'Organization details returned.' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register a new institutional tenant' })
  @ApiResponse({ status: 201, description: 'Organization created.' })
  async create(
    @Body('name') name: string,
    @Body('type') type?: OrgType,
  ) {
    return this.organizationsService.create(name, type);
  }
}
