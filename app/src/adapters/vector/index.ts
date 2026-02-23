import {config} from '../../config';
import {VoiceMemorySnippet} from '../../core/types';
import {localSearch, localUpsert} from './local';
import {opensearchSearch, opensearchUpsert} from './opensearch';

export const vectorSearch = (queryVector: number[], topK: number): Promise<VoiceMemorySnippet[]> => {
  if (config.mode === 'aws' && config.opensearch.endpoint) {
    return opensearchSearch(queryVector, topK);
  }
  return localSearch(queryVector, topK);
};

export const vectorUpsert = (items: Array<{memoryId: string; text: string; tags?: string[]; embedding: number[]}>) => {
  if (config.mode === 'aws' && config.opensearch.endpoint) {
    return opensearchUpsert(items);
  }
  return localUpsert(items);
};
