import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Personalized Recommendations & Remediation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get targeted case practice recommendations based on detected weaknesses' })
  @ApiResponse({ status: 200, description: 'Personalized practice recommendations returned.' })
  async getRecommendations(@CurrentUser('id') userId: string) {
    return this.recommendationsService.getRecommendations(userId);
  }
}
