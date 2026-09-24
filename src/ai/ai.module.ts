import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIOrchestratorService } from './ai-orchestrator.service';
import { ClinicalGuardrailsService } from './guardrails/clinical-guardrails.service';
import { MockLLMProvider } from './providers/mock-llm.provider';
import { OpenAILLMProvider } from './providers/openai-llm.provider';
import { AnthropicLLMProvider } from './providers/anthropic-llm.provider';
import { GeminiLLMProvider } from './providers/gemini-llm.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AIOrchestratorService,
    ClinicalGuardrailsService,
    MockLLMProvider,
    OpenAILLMProvider,
    AnthropicLLMProvider,
    GeminiLLMProvider,
  ],
  exports: [AIOrchestratorService, ClinicalGuardrailsService],
})
export class AIModule {}
