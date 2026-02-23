import {LlmResponse, InboundMessage} from '../../core/types';

export const mockReply = (message: InboundMessage): LlmResponse => ({
  reply_primary: `Hey ${message.senderId}, got your note about \"${message.text}\". Catch up soon! 😊`,
  reply_backup: `Appreciate the update. Will reply properly later.`,
  confidence: 0.85,
  language_mix: 'English+Telugu-lite',
  safety: 'ok'
});
