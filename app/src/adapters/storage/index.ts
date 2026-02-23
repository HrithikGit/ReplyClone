import {InboundMessage, ReplyJob} from '../../core/types';
import {config} from '../../config';
import * as local from './local';
import * as dynamo from './dynamodb';

export const saveMessage = (message: InboundMessage) => {
  if (config.mode === 'aws') {
    return dynamo.saveMessage(message);
  }
  return local.saveMessage(message);
};

export const loadRecentMessages = (limit: number, conversationId?: string) => {
  if (config.mode === 'aws') {
    return dynamo.loadRecentMessages(limit, conversationId);
  }
  return local.loadRecentMessages(limit, conversationId);
};

export const savePendingReply = (job: ReplyJob, response: unknown) => {
  if (config.mode === 'aws') {
    return dynamo.savePendingReply(job, response);
  }
  return local.savePendingReply(job, response);
};

export const checkAndMarkIdempotency = (messageId: string) => {
  if (config.mode === 'aws') {
    return dynamo.checkAndMarkIdempotency(messageId);
  }
  return local.checkAndMarkIdempotency(messageId);
};

export const loadPendingReplies = () => {
  if (config.mode === 'aws') {
    return dynamo.loadPendingReplies();
  }
  return local.loadPendingReplies();
};
