import {InboundMessage} from './types';
import {config} from '../config';

const vibeMap = ['laid-back', 'friendly', 'playful'];

export const createPrompt = (message: InboundMessage) => {
  const vibe = vibeMap[config.teluguVibeLevel % vibeMap.length];
  return `Respond as ReplyClone in short English with ${vibe} Telugu flavor, Romanized phrases allowed, light emojis. Reply to ${message.text} so a ${message.senderId} listener feels a casual, non-formal tone.`;
};
