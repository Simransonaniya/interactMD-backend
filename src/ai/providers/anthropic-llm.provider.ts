import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, PatientPromptContext, LLMResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class AnthropicLLMProvider implements LLMProvider {
  readonly name = 'anthropic';
  private readonly logger = new Logger(AnthropicLLMProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generatePatientResponse(context: PatientPromptContext): Promise<LLMResponse> {
    const apiKey = this.configService.get<string>('ai.anthropic.apiKey');
    const model = this.configService.get<string>('ai.anthropic.model') || 'claude-3-5-sonnet-20241022';

    if (!apiKey) {
      this.logger.warn('Anthropic API key missing.');
      return {
        content: `I'm in severe pain, doctor. Can you please check what is happening?`,
        provider: 'Anthropic (Fallback)',
        model,
      };
    }

    const messages = [
      ...context.conversationHistory.slice(-8).map((m) => ({
        role: m.role === 'STUDENT' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: context.userMessage },
    ];

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          system: context.systemPrompt,
          messages,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text?.trim() || '';

      return {
        content,
        provider: 'Anthropic',
        model,
      };
    } catch (err) {
      this.logger.error(`Anthropic error: ${err.message}`);
      return {
        content: `(Breathing heavily) It hurts right now...`,
        provider: 'Anthropic (Error Fallback)',
        model,
      };
    }
  }
}
