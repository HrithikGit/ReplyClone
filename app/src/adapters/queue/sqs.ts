import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

export const sendToQueue = async (queueUrl: string, body: any) => {
  const client = new SQSClient({});
  await client.send(new SendMessageCommand({QueueUrl: queueUrl, MessageBody: JSON.stringify(body)}));
};
