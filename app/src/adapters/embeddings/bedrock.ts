import {BedrockRuntimeClient, InvokeModelCommand} from '@aws-sdk/client-bedrock-runtime';
import {config} from '../../config';

const client = new BedrockRuntimeClient({region: config.awsRegion});

export const bedrockEmbed = async (text: string): Promise<number[]> => {
  const response = await client.send(
    new InvokeModelCommand({
      modelId: config.embeddings.model,
      body: JSON.stringify({
        inputText: text,
        dimensions: config.embeddings.dimensions,
        normalize: true
      }),
      contentType: 'application/json',
      accept: 'application/json'
    })
  );
  const payload = JSON.parse(new TextDecoder().decode(response.body));
  if (!payload?.embedding) {
    throw new Error('Bedrock returned no embedding');
  }
  return payload.embedding as number[];
};
