import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SubmitDiagnosisDto {
  @ApiProperty({ example: 'dx-stemi', description: 'Selected most likely primary diagnosis ID' })
  @IsString()
  @IsNotEmpty()
  mostLikelyDiagnosisId: string;

  @ApiProperty({
    example: ['dx-dissection', 'dx-pe'],
    description: 'Array of candidate differential diagnoses considered',
  })
  @IsArray()
  differentialDiagnosisIds: string[];

  @ApiProperty({
    example: 'Acute retrosternal crushing chest pain with ST elevations in leads II, III, aVF and elevated hs-cTnI.',
    description: 'Clinical rationale and synthesis justifying the diagnosis',
  })
  @IsString()
  @IsNotEmpty()
  clinicalRationale: string;
}

export class SubmitManagementDto {
  @ApiProperty({
    example: ['mgmt-aspirin', 'mgmt-cath', 'mgmt-heparin'],
    description: 'Array of management protocol IDs selected for patient resuscitation/treatment',
  })
  @IsArray()
  selectedManagementIds: string[];
}
