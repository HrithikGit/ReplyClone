import {VoiceMemorySnippet} from './types';

const sampleMemories: VoiceMemorySnippet[] = [
  {memoryId: '1', text: 'Always respond with playful Telugu flair.'},
  {memoryId: '2', text: 'Some people need short replies with emoji.'}
];

export const retrieveVoiceMemory = (query: string, topK = 3): VoiceMemorySnippet[] => {
  return sampleMemories.slice(0, topK);
};
