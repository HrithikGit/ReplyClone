import dotenv from 'dotenv';

dotenv.config();

const toBool = (value: string | undefined, fallback = false) => {
  if (!value) return fallback;
  return ['1', 'true', 'TRUE', 'yes', 'on'].includes(value.trim());
};

const parseList = (value: string | undefined) => {
  if (!value) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  mode: (process.env.MODE ?? 'local') as 'local' | 'aws',
  enableWhatsAppSend: toBool(process.env.ENABLE_WHATSAPP_SEND, false),
  enableLlmLive: toBool(process.env.ENABLE_LLM_LIVE, false),
  llmProvider: (process.env.LLM_PROVIDER ?? 'mock') as 'mock' | 'deepseek' | 'sarvam',
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? 'changeme',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? 'changeme',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? 'changeme',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? 'changeme'
  },
  allowlist: parseList(process.env.ALLOWLIST_NUMBERS),
  quietHoursStart: process.env.QUIET_HOURS_START ?? '23:00',
  quietHoursEnd: process.env.QUIET_HOURS_END ?? '07:00',
  rateLimitPerHour: parseNumber(process.env.RATE_LIMIT_PER_HOUR, 3),
  contextLastN: parseNumber(process.env.CONTEXT_LAST_N, 12),
  retrievalTopK: parseNumber(process.env.RETRIEVAL_TOP_K, 5),
  teluguVibeLevel: parseNumber(process.env.TELUGU_VIBE_LEVEL, 1),
  llmTokenBudget: parseNumber(process.env.LLM_TOKEN_BUDGET, 512),
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'
  },
  sarvam: {
    apiKey: process.env.SARVAM_API_KEY ?? '',
    baseUrl: process.env.SARVAM_BASE_URL ?? 'https://api.sarvam.ai',
    model: process.env.SARVAM_MODEL ?? 'sarvam-m'
  },
  queueUrl: process.env.QUEUE_URL ?? '',
  tables: {
    contactsTable: process.env.CONTACTS_TABLE ?? '',
    messagesTable: process.env.MESSAGES_TABLE ?? '',
    voiceMemoryTable: process.env.VOICE_MEMORY_TABLE ?? '',
    pendingRepliesTable: process.env.PENDING_REPLIES_TABLE ?? ''
  }
};
