import {VoiceMemorySnippet} from './types';
import {embedText} from '../adapters/embeddings';
import {vectorSearch} from '../adapters/vector';
import {config} from '../config';

export const retrieveVoiceMemory = async (query: string, topK = config.retrievalTopK): Promise<VoiceMemorySnippet[]> => {
  const vector = await embedText(query);
  return vectorSearch(vector, topK);
};
