import {InboundMessage, ReplyJob} from '../../core/types';
import {config} from '../../config';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({region: config.awsRegion}));

export const saveMessage = async (message: InboundMessage) => {
  await dynamoClient.send(
    new PutCommand({
      TableName: config.tables.messagesTable,
      Item: {
        conversationId: message.senderId,
        timestamp_messageId: `${message.timestamp}#${message.messageId}`,
        text: message.text,
        timestamp: message.timestamp,
        platform: message.platform
      }
    })
  );
};

export const loadRecentMessages = async (limit: number, conversationId?: string) => {
  if (!conversationId) {
    return [];
  }
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: config.tables.messagesTable,
      KeyConditionExpression: 'conversationId = :cid',
      ExpressionAttributeValues: {
        ':cid': conversationId
      },
      ScanIndexForward: false,
      Limit: limit
    })
  );
  return (result.Items ?? []).map((item: any) => ({
    platform: 'whatsapp',
    senderId: item.conversationId,
    messageId: (item.timestamp_messageId as string).split('#')[1],
    text: item.text,
    timestamp: item.timestamp
  }));
};

export const savePendingReply = async (job: ReplyJob, response: unknown) => {
  await dynamoClient.send(
    new PutCommand({
      TableName: config.tables.pendingRepliesTable,
      Item: {
        conversationId: job.inbound.senderId,
        createdAt_messageId: `${Date.now()}#${job.inbound.messageId}`,
        job,
        response
      }
    })
  );
};

export const loadPendingReplies = async () => {
  const result = await dynamoClient.send(new ScanCommand({TableName: config.tables.pendingRepliesTable}));
  return result.Items ?? [];
};
