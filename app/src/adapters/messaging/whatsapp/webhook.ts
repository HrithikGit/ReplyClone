import {InboundMessage} from '../../../core/types';

export const verifyChallenge = (query: Record<string, string | undefined>, token: string) => {
  const mode = query['hub.mode'];
  const challenge = query['hub.challenge'];
  const verifyToken = query['hub.verify_token'];
  if (mode === 'subscribe' && verifyToken === token) {
    return challenge;
  }
  return undefined;
};

export const normalizePayload = (body: any): InboundMessage[] => {
  const messages: InboundMessage[] = [];
  (body?.entry ?? []).forEach((entry: any) => {
    (entry?.changes ?? []).forEach((change: any) => {
      const value = change?.value;
      (value?.messages ?? []).forEach((message: any) => {
        messages.push({
          platform: 'whatsapp',
          senderId: message.from,
          messageId: message.id,
          text: message.text?.body ?? '',
          timestamp: Number(message.timestamp ?? Date.now())
        });
      });
    });
  });
  return messages;
};
