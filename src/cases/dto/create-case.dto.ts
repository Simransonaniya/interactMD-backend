import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CaseDifficulty } from '@prisma/client';

export class CreateCaseDto {
  @ApiProperty({ example: 'acute-crushing-chest-pain', description: 'Unique URL slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Acute Crushing Retrosternal Chest Pain' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({ enum: CaseDifficulty, default: CaseDifficulty.INTERMEDIATE })
  @IsEnum(CaseDifficulty)
  difficulty: CaseDifficulty;

  @ApiProperty({ example: '58-year-old male with sudden onset substernal chest heaviness...' })
  @IsString()
  @IsNotEmpty()
  presentation: string;

  @ApiPropertyOptional({ example: 15, default: 15 })
  @IsNumber()
  @IsOptional()
  estimatedMinutes?: number;

  @ApiPropertyOptional({ example: ['Chest Pain', 'Cardiology', 'ECG Interpretation'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['Conduct a focused cardiac history adhering to OPQRST.'] })
  @IsArray()
  @IsOptional()
  learningObjectives?: string[];
}
