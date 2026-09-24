import { Module } from '@nestjs/common';
import { CaseVersionsService } from './case-versions.service';
import { CaseVersionsController } from './case-versions.controller';

@Module({
  controllers: [CaseVersionsController],
  providers: [CaseVersionsService],
  exports: [CaseVersionsService],
})
export class CaseVersionsModule {}
