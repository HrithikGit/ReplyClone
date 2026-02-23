import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {normalizePayload, verifyChallenge} from '../adapters/messaging/whatsapp/webhook';
import {config} from '../config';
import {saveMessage, checkAndMarkIdempotency} from '../adapters/storage';
import {enqueueJob} from '../adapters/queue';
import {ReplyJob} from '../core/types';
import {v4 as uuidv4} from 'uuid';
import {verifySignature} from '../adapters/messaging/whatsapp/verify';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const query = event.queryStringParameters ?? {};
  const challenge = verifyChallenge(query, config.whatsapp.verifyToken);
  if (challenge) {
    return {statusCode: 200, body: challenge};
  }
  const rawBody = event.body ?? '';
  if (!verifySignature(event.headers as Record<string, string>, rawBody, config.metaAppSecret)) {
    return {statusCode: 401, body: 'invalid signature'};
  }
  const body = rawBody ? JSON.parse(rawBody) : {};
  const messages = normalizePayload(body);
  const correlationId = uuidv4();
  await Promise.all(
    messages.map(async (message) => {
      const fresh = await checkAndMarkIdempotency(message.messageId);
      if (!fresh) {
        return;
      }
      await saveMessage(message);
      const job: ReplyJob = {inbound: message, correlationId};
      await enqueueJob(job);
    })
  );
  return {statusCode: 200, body: JSON.stringify({received: messages.length})};
};
