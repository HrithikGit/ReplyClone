import {config} from '../../../config';
import axios from 'axios';
import {LlmResponse} from '../../../core/types';

export const sendReply = async (recipient: string, payload: LlmResponse) => {
  if (!config.enableWhatsAppSend || config.mode !== 'aws') {
    console.log('WhatsApp send skipped', {recipient, mode: config.mode});
    return {status: 'skipped'};
  }
  const url = `https://graph.facebook.com/v17.0/${config.whatsapp.phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: {body: payload.reply_primary}
  };
  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${config.whatsapp.accessToken}`
    }
  });
  return response.data;
};
