import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from './interfaces/llm-provider.interface';
import { MockLLMProvider } from './providers/mock-llm.provider';
import { OpenAILLMProvider } from './providers/openai-llm.provider';
import { AnthropicLLMProvider } from './providers/anthropic-llm.provider';
import { GeminiLLMProvider } from './providers/gemini-llm.provider';
import { ClinicalGuardrailsService } from './guardrails/clinical-guardrails.service';
import { renderPatientSystemPrompt } from './prompts/patient-prompt.template';

export interface OrchestrationResult {
  reply: string;
  category: string;
  empathyDetected: boolean;
  provider: string;
  model: string;
  suggestedTopics: string[];
}

@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);
  private providers: Map<string, LLMProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockLLMProvider,
    private readonly openAIProvider: OpenAILLMProvider,
    private readonly anthropicProvider: AnthropicLLMProvider,
    private readonly geminiProvider: GeminiLLMProvider,
    private readonly guardrails: ClinicalGuardrailsService,
  ) {
    this.providers.set('mock', this.mockProvider);
    this.providers.set('openai', this.openAIProvider);
    this.providers.set('anthropic', this.anthropicProvider);
    this.providers.set('gemini', this.geminiProvider);
  }

  private getActiveProvider(): LLMProvider {
    const pref = (this.configService.get<string>('ai.provider') || 'mock').toLowerCase();
    const provider = this.providers.get(pref);
    if (!provider) {
      this.logger.warn(`Provider '${pref}' not recognized. Falling back to MockLLMProvider.`);
      return this.mockProvider;
    }
    return provider;
  }

  async processLearnerTurn(
    caseVersion: any,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<OrchestrationResult> {
    // 1. Detect Bedside Empathy
    const empathyDetected = this.guardrails.detectEmpathy(userMessage);

    // 2. Classify Intent & Category
    const category = this.classifyIntent(userMessage);

    // 3. Render Controlled System Prompt
    const systemPrompt =
      caseVersion.systemPromptTemplate || renderPatientSystemPrompt(caseVersion);

    // 4. Dispatch to Pluggable LLM Provider
    const provider = this.getActiveProvider();
    const patientProfile = caseVersion.patientProfile || {};
    const chiefComplaint = caseVersion.chiefComplaint?.complaint || patientProfile.presentationComplaint || '';

    const llmResponse = await provider.generatePatientResponse({
      systemPrompt,
      patientName: patientProfile.name || 'Patient',
      chiefComplaint,
      historyFacts: caseVersion.historyFacts || {},
      currentPatientState: {},
      conversationHistory,
      userMessage,
    });

    // 5. Post-Generation Clinical Guardrail Sanitize
    const cleanReply = this.guardrails.sanitizePatientResponse(
      llmResponse.content,
      caseVersion,
    );

    // 6. Compute Guided Next Clinical Topics
    const suggestedTopics = this.computeSuggestedNextTopics(
      conversationHistory,
      userMessage,
    );

    return {
      reply: cleanReply,
      category,
      empathyDetected,
      provider: llmResponse.provider,
      model: llmResponse.model,
      suggestedTopics,
    };
  }

  private classifyIntent(message: string): string {
    const m = message.toLowerCase();
    if (m.includes('when') || m.includes('start') || m.includes('feel like') || m.includes('radiat') || m.includes('better') || m.includes('worse') || m.includes('scale')) {
      return 'HPI';
    }
    if (m.includes('past') || m.includes('history') || m.includes('condition') || m.includes('chronic')) {
      return 'PMH';
    }
    if (m.includes('medicat') || m.includes('pill') || m.includes('inhaler') || m.includes('prescript')) {
      return 'Meds';
    }
    if (m.includes('allerg')) {
      return 'Allergies';
    }
    if (m.includes('smoke') || m.includes('alcohol') || m.includes('drink') || m.includes('family')) {
      return 'Social';
    }
    return 'General';
  }

  private computeSuggestedNextTopics(
    history: Array<{ role: string; content: string }>,
    currentMsg: string,
  ): string[] {
    const combinedDoctorText = [
      ...history.filter((m) => m.role === 'STUDENT').map((m) => m.content.toLowerCase()),
      currentMsg.toLowerCase(),
    ].join(' ');

    const suggestions: string[] = [];

    if (!combinedDoctorText.includes('when') && !combinedDoctorText.includes('start') && !combinedDoctorText.includes('onset')) {
      suggestions.push('Clarify precise onset & what patient was doing when pain began');
    }
    if (!combinedDoctorText.includes('radiat') && !combinedDoctorText.includes('spread') && !combinedDoctorText.includes('jaw') && !combinedDoctorText.includes('arm')) {
      suggestions.push('Screen for symptom radiation (jaw, back, neck, shoulder)');
    }
    if (!combinedDoctorText.includes('medicat') && !combinedDoctorText.includes('prescript') && !combinedDoctorText.includes('pill')) {
      suggestions.push('Inquire regarding daily prescription medications and adherence');
    }
    if (!combinedDoctorText.includes('allerg')) {
      suggestions.push('Check for drug, environmental, or food allergies');
    }
    if (!combinedDoctorText.includes('family') && !combinedDoctorText.includes('father') && !combinedDoctorText.includes('mother')) {
      suggestions.push('Inquire about family history of early heart disease or respiratory conditions');
    }

    return suggestions.slice(0, 3);
  }
}
