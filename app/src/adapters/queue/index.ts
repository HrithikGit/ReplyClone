import {config} from '../../config';
import {ReplyJob} from '../../core/types';
import {enqueue as enqueueLocal} from './local';
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({region: config.awsRegion});

export const enqueueJob = async (job: ReplyJob) => {
  if (config.mode === 'aws') {
    if (!config.queueUrl) {
      throw new Error('QUEUE_URL missing in aws mode');
    }
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: config.queueUrl,
        MessageBody: JSON.stringify(job)
      })
    );
  } else {
    await enqueueLocal(job);
  }
};
