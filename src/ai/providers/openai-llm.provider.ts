import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, PatientPromptContext, LLMResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAILLMProvider implements LLMProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAILLMProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generatePatientResponse(context: PatientPromptContext): Promise<LLMResponse> {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    const model = this.configService.get<string>('ai.openai.model') || 'gpt-4o-mini';

    if (!apiKey) {
      this.logger.warn('OpenAI API key missing. Falling back to structured response.');
      return {
        content: `I'm in severe discomfort, doctor. Please help me...`,
        provider: 'OpenAI (Fallback)',
        model,
      };
    }

    const messages = [
      { role: 'system', content: context.systemPrompt },
      ...context.conversationHistory.slice(-8).map((m) => ({
        role: m.role === 'STUDENT' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: context.userMessage },
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 250,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      return {
        content,
        provider: 'OpenAI',
        model,
      };
    } catch (err) {
      this.logger.error(`OpenAI error: ${err.message}`);
      return {
        content: `(Wincing in pain) It really hurts right now, doctor...`,
        provider: 'OpenAI (Error Fallback)',
        model,
      };
    }
  }
}
