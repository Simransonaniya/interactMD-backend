import { Controller, Get, Head } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health & System')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'System Root & Status' })
  getRoot() {
    return {
      status: 'ok',
      service: 'InteractMD Clinical Simulation Backend',
      version: '1.0.0',
      docs: '/api/docs',
      api: '/api/v1',
    };
  }

  @Public()
  @Head()
  headRoot() {
    return;
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
