import {InboundMessage, ReplyJob} from '../../core/types';
import {promises as fs} from 'fs';
import path from 'path';

const storagePath = path.join(__dirname, '../../../local-storage.jsonl');

const writeLine = async (obj: any) => {
  await fs.appendFile(storagePath, JSON.stringify(obj) + '\n');
};

export const saveMessage = async (message: InboundMessage) => {
  await writeLine({type: 'message', payload: message});
};

export const loadRecentMessages = async (limit: number, conversationId?: string): Promise<InboundMessage[]> => {
  try {
    const data = await fs.readFile(storagePath, 'utf8');
    const lines = data.trim().split('\n').filter(Boolean).reverse();
    const messages: InboundMessage[] = [];
    for (const line of lines) {
      const parsed = JSON.parse(line);
      if (parsed.type === 'message') {
        if (!conversationId || parsed.payload.senderId === conversationId) {
          messages.push(parsed.payload);
        }
        if (messages.length >= limit) break;
      }
    }
    return messages;
  } catch (err) {
    return [];
  }
};

export const savePendingReply = async (job: ReplyJob, response: any) => {
  await writeLine({type: 'pending', job, response});
};

export const loadPendingReplies = async () => {
  try {
    const data = await fs.readFile(storagePath, 'utf8');
    return data
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
      .filter((item) => item.type === 'pending');
  } catch {
    return [];
  }
};
