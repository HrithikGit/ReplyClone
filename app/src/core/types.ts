export type Platform = 'whatsapp' | 'instagram';

export interface InboundMessage {
  platform: Platform;
  senderId: string;
  messageId: string;
  text: string;
  timestamp: number;
}

export type GuardrailResult = 'send' | 'hold' | 'drop';

export interface GuardrailOutcome {
  decision: GuardrailResult;
  reason: string;
}

export interface LlmResponse {
  reply_primary: string;
  reply_backup: string;
  confidence: number;
  language_mix: string;
  safety: 'ok' | 'hold';
}

export interface VoiceMemorySnippet {
  memoryId: string;
  text: string;
  tags?: string[];
}

export interface ReplyJob {
  inbound: InboundMessage;
  correlationId: string;
}
