import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, PatientPromptContext, LLMResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiLLMProvider implements LLMProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiLLMProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generatePatientResponse(context: PatientPromptContext): Promise<LLMResponse> {
    const apiKey = this.configService.get<string>('ai.gemini.apiKey');
    const model = this.configService.get<string>('ai.gemini.model') || 'gemini-2.5-flash';

    if (!apiKey) {
      this.logger.warn('Gemini API key missing.');
      return {
        content: `I am having a lot of chest tightness, doctor...`,
        provider: 'Gemini (Fallback)',
        model,
      };
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${context.systemPrompt}\n\nDoctor: ${context.userMessage}` }],
      },
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      return {
        content,
        provider: 'Google Gemini',
        model,
      };
    } catch (err) {
      this.logger.error(`Gemini error: ${err.message}`);
      return {
        content: `I feel so weak right now, doctor...`,
        provider: 'Gemini (Error Fallback)',
        model,
      };
    }
  }
}
