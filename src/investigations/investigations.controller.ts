import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestigationsService } from './investigations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Physical Exam & Controlled Investigations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('simulations/:sessionId')
export class InvestigationsController {
  constructor(private readonly investigationsService: InvestigationsService) {}

  @Post('examination')
  @ApiOperation({ summary: 'Perform physical examination maneuvers and reveal predefined findings' })
  @ApiResponse({ status: 200, description: 'Objective physical findings returned.' })
  async performExam(
    @Param('sessionId') sessionId: string,
    @Body('system') system: string,
    @Body('examId') examId?: string,
  ) {
    return this.investigationsService.performPhysicalExam(sessionId, system, examId);
  }

  @Post('investigations')
  @ApiOperation({ summary: 'Order controlled diagnostic laboratory/imaging tests' })
  @ApiResponse({ status: 200, description: 'Predefined diagnostic reports returned.' })
  async orderTest(
    @Param('sessionId') sessionId: string,
    @Body('test') test: string,
  ) {
    return this.investigationsService.orderInvestigation(sessionId, test);
  }
}
