import {InboundMessage, GuardrailOutcome} from './types';
import {config} from '../config';

const sensitiveKeywords = ['suicide', 'bomb', 'attack', 'money'];

const isQuietHours = (timestamp: number) => {
  const date = new Date(timestamp);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const [startH, startM] = config.quietHoursStart.split(':').map(Number);
  const [endH, endM] = config.quietHoursEnd.split(':').map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (start < end) {
    return minutes >= start && minutes <= end;
  }
  return minutes >= start || minutes <= end;
};

export const allowlistCheck = (message: InboundMessage): GuardrailOutcome => {
  if (!config.allowlist.length) {
    return {decision: 'send', reason: 'allowlist empty (local mode)'};
  }
  if (config.allowlist.includes(message.senderId)) {
    return {decision: 'send', reason: 'sender allowlisted'};
  }
  return {decision: 'hold', reason: 'sender not in allowlist'};
};

export const sensitivityCheck = (message: InboundMessage): GuardrailOutcome => {
  const text = message.text.toLowerCase();
  const found = sensitiveKeywords.find((keyword) => text.includes(keyword));
  if (found) {
    return {decision: 'hold', reason: `sensitive keyword ${found}`};
  }
  if (isQuietHours(message.timestamp)) {
    return {decision: 'hold', reason: 'quiet hours'};
  }
  return {decision: 'send', reason: 'no issues'};
};

export const rateLimitCheck = (messages: InboundMessage[]): GuardrailOutcome => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recent = messages.filter((msg) => msg.timestamp >= oneHourAgo);
  if (recent.length >= config.rateLimitPerHour) {
    return {decision: 'hold', reason: 'rate limit exceeded'};
  }
  return {decision: 'send', reason: 'rate limit OK'};
};

export const confidenceCheck = (confidence: number): GuardrailOutcome => {
  if (confidence < 0.65) {
    return {decision: 'hold', reason: 'low confidence'};
  }
  return {decision: 'send', reason: 'confidence OK'};
};
