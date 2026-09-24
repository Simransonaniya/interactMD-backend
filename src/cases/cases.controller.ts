import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { QueryCasesDto } from './dto/query-cases.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Case Library')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all published clinical cases with filters and active patient profiles' })
  @ApiResponse({ status: 200, description: 'List of cases returned successfully.' })
  async findAll(@Query() query: QueryCasesDto) {
    return this.casesService.findAll(query);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get full clinical case specification including active version data' })
  @ApiResponse({ status: 200, description: 'Case details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Case not found.' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.casesService.findOne(idOrSlug);
  }
}
