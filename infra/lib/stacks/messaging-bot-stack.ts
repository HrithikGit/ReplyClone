import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {QueueConstruct} from '../constructs/queue-construct';
import {StorageConstruct} from '../constructs/storage-construct';
import {SecretsConstruct} from '../constructs/secrets-construct';
import {LambdasConstruct} from '../constructs/lambdas-construct';
import {ApiConstruct} from '../constructs/api-construct';

export class MessagingBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const queue = new QueueConstruct(this, 'Queue', {
      queueName: `${this.stackName}-Queue`,
      dlqName: `${this.stackName}-DLQ`
    });
    const storage = new StorageConstruct(this, 'Storage', {prefix: this.stackName});
    const secrets = new SecretsConstruct(this, 'Secrets');
    const lambdas = new LambdasConstruct(this, 'Lambdas', {
      queue: queue.queue,
      contactsTableName: storage.contactsTable.tableName,
      messagesTableName: storage.messagesTable.tableName,
      pendingRepliesTableName: storage.pendingRepliesTable.tableName,
      secrets: secrets.whatsappSecrets
    });
    const api = new ApiConstruct(this, 'Api', {webhookHandler: lambdas.webhookHandler});

    queue.queue.grantSendMessages(lambdas.webhookHandler);
    queue.queue.grantConsumeMessages(lambdas.replyWorker);
    storage.messagesTable.grantReadWriteData(lambdas.webhookHandler);
    storage.messagesTable.grantReadWriteData(lambdas.replyWorker);
    storage.pendingRepliesTable.grantReadWriteData(lambdas.replyWorker);
    storage.contactsTable.grantReadWriteData(lambdas.replyWorker);
    storage.voiceMemoryTable.grantReadWriteData(lambdas.replyWorker);
    secrets.whatsappSecrets.grantRead(lambdas.webhookHandler);
    secrets.whatsappSecrets.grantRead(lambdas.replyWorker);

    new CfnOutput(this, 'WebhookUrl', {value: `${api.api.apiEndpoint}/webhook/whatsapp`});
    new CfnOutput(this, 'QueueUrl', {value: queue.queue.queueUrl});
    new CfnOutput(this, 'ContactsTable', {value: storage.contactsTable.tableName});
    new CfnOutput(this, 'MessagesTable', {value: storage.messagesTable.tableName});
    new CfnOutput(this, 'VoiceMemoryTable', {value: storage.voiceMemoryTable.tableName});
    new CfnOutput(this, 'PendingRepliesTable', {value: storage.pendingRepliesTable.tableName});
  }
}
