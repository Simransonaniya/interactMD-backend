import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('OSCE Evaluation & Scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('session/:sessionId')
  @ApiOperation({ summary: 'Generate attending physician OSCE scorecard across 5 clinical dimensions' })
  @ApiResponse({ status: 201, description: 'Evaluation generated successfully.' })
  async evaluateSession(@Param('sessionId') sessionId: string) {
    return this.evaluationService.evaluateSession(sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve full evaluation result by evaluation ID' })
  @ApiResponse({ status: 200, description: 'Evaluation scorecard retrieved.' })
  async getEvaluation(@Param('id') id: string) {
    return this.evaluationService.getEvaluation(id);
  }
}
