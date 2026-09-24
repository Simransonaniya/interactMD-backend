export interface PatientPromptContext {
  systemPrompt: string;
  patientName: string;
  chiefComplaint: string;
  historyFacts: any;
  currentPatientState: any;
  conversationHistory: Array<{ role: string; content: string }>;
  userMessage: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  generatePatientResponse(context: PatientPromptContext): Promise<LLMResponse>;
}
