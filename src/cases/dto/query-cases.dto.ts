import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CaseDifficulty } from '@prisma/client';

export class QueryCasesDto {
  @ApiPropertyOptional({ description: 'Search term across title, presentation, and tags' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by specialty (e.g. Cardiology, Pulmonology)' })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional({ enum: CaseDifficulty, description: 'Filter by difficulty tier' })
  @IsEnum(CaseDifficulty)
  @IsOptional()
  difficulty?: CaseDifficulty;
}
