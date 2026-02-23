import {InboundMessage, VoiceMemorySnippet} from './types';
import {config} from '../config';

const vibeMap = ['laid-back', 'friendly', 'playful'];

export const createPrompt = (
  message: InboundMessage,
  memory: VoiceMemorySnippet[] = [],
  recent: InboundMessage[] = []
) => {
  const vibe = vibeMap[config.teluguVibeLevel % vibeMap.length];
  const memoryBlock = memory.length
    ? `Voice memory snippets:\\n${memory.map((m) => `- ${m.text}`).join('\\n')}`
    : 'No voice memory snippets.';
  const contextBlock = recent.length
    ? `Recent context:\\n${recent.map((m) => `- ${m.text}`).join('\\n')}`
    : 'No recent context.';
  return `Respond as ReplyClone in short English with ${vibe} Telugu flavor, Romanized phrases allowed, light emojis. Reply to ${message.text} so a ${message.senderId} listener feels a casual, non-formal tone.\\n\\n${memoryBlock}\\n\\n${contextBlock}`; 
};
