import {InboundMessage} from './types';

export const classifyLabel = (message: InboundMessage): 'friend' | 'family' | 'work' => {
  const text = message.text.toLowerCase();
  if (text.includes('boss') || text.includes('project')) return 'work';
  if (text.includes('sis') || text.includes('mom') || text.includes('family')) return 'family';
  return 'friend';
};

export const classifyIntent = (message: InboundMessage) => {
  if (message.text.endsWith('?')) return 'question';
  if (message.text.toLowerCase().includes('urgent')) return 'urgent';
  return 'chat';
};
