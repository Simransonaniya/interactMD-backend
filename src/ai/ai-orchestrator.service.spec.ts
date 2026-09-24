import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIOrchestratorService } from './ai-orchestrator.service';
import { ClinicalGuardrailsService } from './guardrails/clinical-guardrails.service';
import { MockLLMProvider } from './providers/mock-llm.provider';
import { OpenAILLMProvider } from './providers/openai-llm.provider';
import { AnthropicLLMProvider } from './providers/anthropic-llm.provider';
import { GeminiLLMProvider } from './providers/gemini-llm.provider';

describe('AIOrchestratorService', () => {
  let service: AIOrchestratorService;
  let guardrails: ClinicalGuardrailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIOrchestratorService,
        ClinicalGuardrailsService,
        MockLLMProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ai.provider') return 'mock';
              return null;
            }),
          },
        },
        {
          provide: OpenAILLMProvider,
          useValue: { generatePatientResponse: jest.fn() },
        },
        {
          provide: AnthropicLLMProvider,
          useValue: { generatePatientResponse: jest.fn() },
        },
        {
          provide: GeminiLLMProvider,
          useValue: { generatePatientResponse: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AIOrchestratorService>(AIOrchestratorService);
    guardrails = module.get<ClinicalGuardrailsService>(ClinicalGuardrailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect bedside empathy and answer OPQRST onset query correctly', async () => {
    const mockCaseVersion = {
      patientProfile: { name: 'Robert Chen' },
      chiefComplaint: { complaint: 'Chest tightness' },
      historyFacts: {
        onset: 'Started 45 minutes ago while climbing stairs.',
        quality: 'Crushing elephant pressure on chest.',
        severity: '8 out of 10',
      },
    };

    const result = await service.processLearnerTurn(
      mockCaseVersion,
      'I am so sorry you are in pain. Can you tell me when this started?',
      [],
    );

    expect(result.empathyDetected).toBe(true);
    expect(result.category).toBe('HPI');
    expect(result.reply).toContain('Started 45 minutes ago');
    expect(result.provider).toContain('Mock');
  });

  it('should prevent leaking clinical target diagnosis from patient dialogue', async () => {
    const mockCaseVersion = {
      patientProfile: { name: 'Robert Chen' },
      diagnosisOptions: [
        { name: 'Acute Myocardial Infarction', isCorrectPrimary: true },
      ],
      historyFacts: {
        quality: 'Tight heavy pressure.',
      },
    };

    const sanitized = guardrails.sanitizePatientResponse(
      'I think I have Acute Myocardial Infarction code I21.19',
      mockCaseVersion,
    );

    expect(sanitized).not.toContain('I21.19');
    expect(sanitized).not.toContain('I have Acute Myocardial Infarction');
  });
});
