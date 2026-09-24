import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiagnosisService } from './diagnosis.service';
import { SubmitDiagnosisDto, SubmitManagementDto } from './dto/submit-diagnosis.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Clinical Reasoning, Diagnosis & Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('simulations/:sessionId')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post('diagnosis')
  @ApiOperation({ summary: 'Submit differential diagnosis, target primary diagnosis, and clinical rationale' })
  @ApiResponse({ status: 200, description: 'Diagnosis recorded and stage transitioned to MANAGEMENT.' })
  async submitDiagnosis(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitDiagnosisDto,
  ) {
    return this.diagnosisService.submitDiagnosis(sessionId, dto);
  }

  @Post('management')
  @ApiOperation({ summary: 'Submit guideline-directed treatment protocols and resuscitation orders' })
  @ApiResponse({ status: 200, description: 'Management recorded and stage transitioned to EVALUATION.' })
  async submitManagement(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitManagementDto,
  ) {
    return this.diagnosisService.submitManagement(sessionId, dto);
  }
}
