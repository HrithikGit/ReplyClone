import {config} from '../../config';
import {mockEmbed} from './mock';
import {bedrockEmbed} from './bedrock';

export const embedText = async (text: string): Promise<number[]> => {
  if (config.mode === 'aws' && config.enableEmbeddingsLive && config.embeddings.provider === 'bedrock') {
    return bedrockEmbed(text);
  }
  return mockEmbed(text);
};
