import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { StartSessionDto, PostMessageDto } from './dto/start-session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Simulation Encounter & AI Patient')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start or resume an interactive clinical simulation encounter' })
  @ApiResponse({ status: 201, description: 'Simulation session initialized with active patient state.' })
  async startSession(
    @CurrentUser('id') userId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.simulationService.startSession(userId, dto);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Retrieve full simulation state, conversation history, and events' })
  @ApiResponse({ status: 200, description: 'Simulation session state.' })
  async getSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.simulationService.getSession(sessionId, userId);
  }

  @Post(':sessionId/messages')
  @ApiOperation({ summary: 'Send a clinical inquiry message to the AI virtual patient' })
  @ApiResponse({ status: 200, description: 'Patient natural language response and updated stage.' })
  async postMessage(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PostMessageDto,
  ) {
    return this.simulationService.postMessage(sessionId, userId, dto);
  }
}
