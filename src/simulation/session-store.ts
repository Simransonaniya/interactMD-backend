export interface MemorySession {
  id: string;
  userId: string;
  caseId: string;
  caseVersionId: string;
  status: string;
  currentStage: string;
  startedAt: Date;
  durationSeconds: number;
  caseVersion: any;
  messages: any[];
  events: any[];
  evaluation?: any;
}

export const MEMORY_SESSIONS = new Map<string, MemorySession>();
