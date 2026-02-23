import axios from 'axios';
import {InboundMessage, LlmResponse, VoiceMemorySnippet} from '../../core/types';
import {config} from '../../config';
import {createPrompt} from '../../core/prompt';

export const sarvamReply = async (
  message: InboundMessage,
  memory: VoiceMemorySnippet[] = [],
  recent: InboundMessage[] = []
): Promise<LlmResponse> => {
  if (!config.sarvam.apiKey) {
    throw new Error('SARVAM_API_KEY missing');
  }
  const url = `${config.sarvam.baseUrl}/v1/chat/completions`;
  const system = 'Return STRICT JSON only. Schema: {reply_primary, reply_backup, confidence, language_mix, safety}.';
  const user = createPrompt(message, memory, recent);

  const response = await axios.post(
    url,
    {
      model: config.sarvam.model,
      messages: [
        {role: 'system', content: system},
        {role: 'user', content: user}
      ],
      temperature: 0.2
    },
    {
      headers: {
        'api-subscription-key': config.sarvam.apiKey
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Sarvam returned empty response');
  }
  return JSON.parse(content) as LlmResponse;
};
