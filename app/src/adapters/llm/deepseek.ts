import axios from 'axios';
import {InboundMessage, LlmResponse} from '../../core/types';
import {config} from '../../config';
import {createPrompt} from '../../core/prompt';

export const deepseekReply = async (message: InboundMessage): Promise<LlmResponse> => {
  if (!config.deepseek.apiKey) {
    throw new Error('DEEPSEEK_API_KEY missing');
  }
  const url = `${config.deepseek.baseUrl}/chat/completions`;
  const system = 'Return STRICT JSON only. Schema: {reply_primary, reply_backup, confidence, language_mix, safety}.';
  const user = createPrompt(message);

  const response = await axios.post(
    url,
    {
      model: config.deepseek.model,
      messages: [
        {role: 'system', content: system},
        {role: 'user', content: user}
      ],
      temperature: 0.6
    },
    {
      headers: {
        Authorization: `Bearer ${config.deepseek.apiKey}`
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Deepseek returned empty response');
  }
  return JSON.parse(content) as LlmResponse;
};
