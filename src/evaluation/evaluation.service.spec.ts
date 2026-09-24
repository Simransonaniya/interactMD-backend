import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationService } from './evaluation.service';
import { PrismaService } from '../database/prisma.service';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        {
          provide: PrismaService,
          useValue: {
            simulationSession: { findUnique: jest.fn() },
            clinicalEvaluation: { create: jest.fn() },
            interactionEvent: { create: jest.fn() },
            learnerWeakness: { upsert: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
