import {LlmResponse} from './types';

export const formatReplyOutput = (response: LlmResponse): LlmResponse => {
  const truncated = (text: string) => (text.length > 240 ? `${text.slice(0, 237)}...` : text);
  return {
    ...response,
    reply_primary: truncated(response.reply_primary),
    reply_backup: truncated(response.reply_backup)
  };
};
