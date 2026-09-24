import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({ example: 'case-acs-1', description: 'Case ID or slug to launch' })
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @ApiPropertyOptional({ description: 'Optional specific case version ID' })
  @IsString()
  @IsOptional()
  caseVersionId?: string;
}

export class PostMessageDto {
  @ApiProperty({ example: 'Can you tell me when the pain started and what you were doing?' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
