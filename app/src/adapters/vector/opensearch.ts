import {Client} from '@opensearch-project/opensearch';
import {AwsSigv4Signer} from '@opensearch-project/opensearch/aws';
import {defaultProvider} from '@aws-sdk/credential-provider-node';
import {config} from '../../config';
import {VoiceMemorySnippet} from '../../core/types';

const getClient = () => {
  if (!config.opensearch.endpoint) {
    throw new Error('OPENSEARCH_ENDPOINT missing');
  }
  return new Client({
    ...AwsSigv4Signer({
      region: config.awsRegion,
      service: 'aoss',
      getCredentials: () => defaultProvider()()
    }),
    node: config.opensearch.endpoint
  });
};

export const opensearchSearch = async (queryVector: number[], topK: number): Promise<VoiceMemorySnippet[]> => {
  const response = await getClient().search({
    index: config.opensearch.index,
    size: topK,
    query: {
      knn: {
        vector: queryVector,
        k: topK
      }
    }
  });
  const hits = response.body?.hits?.hits ?? [];
  return hits.map((hit: any) => ({
    memoryId: hit._source.memoryId,
    text: hit._source.text,
    tags: hit._source.tags ?? []
  }));
};

export const opensearchUpsert = async (items: Array<{memoryId: string; text: string; tags?: string[]; embedding: number[]}>) => {
  const body: any[] = [];
  items.forEach((item) => {
    body.push({index: {_index: config.opensearch.index, _id: item.memoryId}});
    body.push({
      memoryId: item.memoryId,
      text: item.text,
      tags: item.tags ?? [],
      vector: item.embedding
    });
  });
  await getClient().bulk({refresh: true, body});
};
