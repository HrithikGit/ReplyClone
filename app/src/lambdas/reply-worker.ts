import {SQSEvent} from 'aws-lambda';
import {ReplyJob, InboundMessage, LlmResponse} from '../core/types';
import {mockReply} from '../adapters/llm/mock';
import {deepseekReply} from '../adapters/llm/deepseek';
import {allowlistCheck, sensitivityCheck, confidenceCheck, rateLimitCheck} from '../core/guardrails';
import {formatReplyOutput} from '../core/formatter';
import {loadRecentMessages, savePendingReply} from '../adapters/storage';
import {sendReply} from '../adapters/messaging/whatsapp/client';
import {config} from '../config';

const loadContext = async (message: InboundMessage) => {
  return loadRecentMessages(config.contextLastN, message.senderId);
};

const processJob = async (job: ReplyJob) => {
  const allowOutcome = allowlistCheck(job.inbound);
  if (allowOutcome.decision === 'hold') {
    await savePendingReply(job, {reason: allowOutcome.reason});
    return;
  }
  const guardOutcome = sensitivityCheck(job.inbound);
  if (guardOutcome.decision === 'hold') {
    await savePendingReply(job, {reason: guardOutcome.reason});
    return;
  }
  const context = await loadContext(job.inbound);
  const rateOutcome = rateLimitCheck(context);
  if (rateOutcome.decision === 'hold') {
    await savePendingReply(job, {reason: rateOutcome.reason});
    return;
  }
  let llmResponse: LlmResponse;
  if (config.enableLlmLive && config.mode === 'aws' && config.llmProvider === 'deepseek') {
    llmResponse = await deepseekReply(job.inbound);
  } else {
    llmResponse = mockReply(job.inbound);
  }
  const formatted = formatReplyOutput(llmResponse);
  const confidenceOutcome = confidenceCheck(formatted.confidence);
  if (confidenceOutcome.decision === 'hold' || formatted.safety === 'hold') {
    await savePendingReply(job, {reason: confidenceOutcome.reason});
    return;
  }
  await sendReply(job.inbound.senderId, formatted);
};

export const handleJob = async (job: ReplyJob) => {
  try {
    await processJob(job);
  } catch (error) {
    console.error('worker failed', error, {job});
  }
};

export const handler = async (event: SQSEvent) => {
  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const job = JSON.parse(record.body) as ReplyJob;
        await handleJob(job);
      } catch (inner) {
        console.error('failed to parse record', inner, {record});
      }
    })
  );
};
