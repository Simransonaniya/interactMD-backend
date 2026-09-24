import { Injectable } from '@nestjs/common';

@Injectable()
export class ClinicalGuardrailsService {
  private readonly empathyKeywords = [
    'sorry',
    'comfort',
    'take care',
    'help you',
    'safe',
    'breathe',
    'rest',
    'stay calm',
    "don't worry",
    'take your time',
    'understand',
    'i hear you',
    'we will figure this out',
  ];

  private readonly jargonKeywords = [
    'ischemic penumbra',
    'transmural necrosis',
    'pathognomonic',
    'atherothrombotic cascade',
    'curb-65',
    'appendicolith',
    'leukocytosis',
    'bandemia',
  ];

  detectEmpathy(text: string): boolean {
    const lower = text.toLowerCase();
    return this.empathyKeywords.some((k) => lower.includes(k));
  }

  detectMedicalJargon(text: string): string[] {
    const lower = text.toLowerCase();
    return this.jargonKeywords.filter((j) => lower.includes(j));
  }

  sanitizePatientResponse(response: string, caseVersion: any): string {
    let sanitized = response;

    // Redact accidental ICD codes (e.g. I21.19, J45.901)
    sanitized = sanitized.replace(/\b[A-Z]\d{2}(\.\d{1,3})?\b/g, '');

    // Prevent textbook diagnosis leakage from virtual patient
    const diagnosticOptions = caseVersion?.diagnosisOptions || [];
    for (const dx of diagnosticOptions) {
      if (dx.isCorrectPrimary && dx.name) {
        const regex = new RegExp(`I have (an? )?${dx.name}`, 'gi');
        sanitized = sanitized.replace(regex, 'I am in a lot of pain');
      }
    }

    return sanitized.trim();
  }
}
