import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {QueueConstruct} from '../constructs/queue-construct';
import {StorageConstruct} from '../constructs/storage-construct';
import {SecretsConstruct} from '../constructs/secrets-construct';
import {LambdasConstruct} from '../constructs/lambdas-construct';
import {ApiConstruct} from '../constructs/api-construct';
import {OpenSearchConstruct} from '../constructs/opensearch-construct';
import {OpenSearchAccessPolicy} from '../constructs/opensearch-access-policy';

export class MessagingBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const queue = new QueueConstruct(this, 'Queue', {
      queueName: `${this.stackName}-Queue`,
      dlqName: `${this.stackName}-DLQ`
    });
    const storage = new StorageConstruct(this, 'Storage', {prefix: this.stackName});
    const secrets = new SecretsConstruct(this, 'Secrets');
    const opensearch = new OpenSearchConstruct(this, 'OpenSearch', {name: `${this.stackName.toLowerCase()}-vector`});
    const lambdas = new LambdasConstruct(this, 'Lambdas', {
      queue: queue.queue,
      contactsTableName: storage.contactsTable.tableName,
      messagesTableName: storage.messagesTable.tableName,
      pendingRepliesTableName: storage.pendingRepliesTable.tableName,
      idempotencyTableName: storage.idempotencyTable.tableName,
      secrets: secrets.whatsappSecrets,
      opensearchEndpoint: opensearch.collectionEndpoint,
      opensearchIndex: 'voice-memory',
      embeddingsProvider: 'bedrock',
      embeddingsModel: 'amazon.titan-embed-text-v2:0',
      embeddingsDim: '1024'
    });
    const principals = [lambdas.replyWorker.role?.roleArn, lambdas.webhookHandler.role?.roleArn].filter(
      (arn): arn is string => Boolean(arn)
    );
    new OpenSearchAccessPolicy(this, 'OpenSearchAccess', {
      name: this.stackName.toLowerCase(),
      collectionName: opensearch.collectionName,
      principals
    });
    const api = new ApiConstruct(this, 'Api', {webhookHandler: lambdas.webhookHandler});

    queue.queue.grantSendMessages(lambdas.webhookHandler);
    queue.queue.grantConsumeMessages(lambdas.replyWorker);
    storage.messagesTable.grantReadWriteData(lambdas.webhookHandler);
    storage.messagesTable.grantReadWriteData(lambdas.replyWorker);
    storage.pendingRepliesTable.grantReadWriteData(lambdas.replyWorker);
    storage.contactsTable.grantReadWriteData(lambdas.replyWorker);
    storage.voiceMemoryTable.grantReadWriteData(lambdas.replyWorker);
    storage.idempotencyTable.grantReadWriteData(lambdas.webhookHandler);
    storage.idempotencyTable.grantReadWriteData(lambdas.replyWorker);
    secrets.whatsappSecrets.grantRead(lambdas.webhookHandler);
    secrets.whatsappSecrets.grantRead(lambdas.replyWorker);

    new CfnOutput(this, 'WebhookUrl', {value: `${api.api.apiEndpoint}/webhook/whatsapp`});
    new CfnOutput(this, 'QueueUrl', {value: queue.queue.queueUrl});
    new CfnOutput(this, 'ContactsTable', {value: storage.contactsTable.tableName});
    new CfnOutput(this, 'MessagesTable', {value: storage.messagesTable.tableName});
    new CfnOutput(this, 'VoiceMemoryTable', {value: storage.voiceMemoryTable.tableName});
    new CfnOutput(this, 'PendingRepliesTable', {value: storage.pendingRepliesTable.tableName});
    new CfnOutput(this, 'IdempotencyTable', {value: storage.idempotencyTable.tableName});
    new CfnOutput(this, 'OpenSearchEndpoint', {value: opensearch.collectionEndpoint});
  }
}
