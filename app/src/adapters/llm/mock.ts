import {LlmResponse, InboundMessage, VoiceMemorySnippet} from '../../core/types';

export const mockReply = (
  message: InboundMessage,
  memory: VoiceMemorySnippet[] = []
): LlmResponse => ({
  reply_primary: `Hey ${message.senderId}, got your note about \"${message.text}\". ${memory.length ? 'Will keep your vibe in mind.' : 'Catch up soon!'} 😊`,
  reply_backup: `Appreciate the update. Will reply properly later.`,
  confidence: 0.85,
  language_mix: 'English+Telugu-lite',
  safety: 'ok'
});
