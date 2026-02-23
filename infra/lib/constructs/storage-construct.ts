import {Construct} from 'constructs';
import {AttributeType, BillingMode, Table} from 'aws-cdk-lib/aws-dynamodb';
import {RemovalPolicy} from 'aws-cdk-lib';

export interface StorageConstructProps {
  readonly prefix: string;
}

export class StorageConstruct extends Construct {
  public readonly contactsTable: Table;
  public readonly messagesTable: Table;
  public readonly voiceMemoryTable: Table;
  public readonly pendingRepliesTable: Table;
  public readonly idempotencyTable: Table;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);
    this.contactsTable = new Table(this, 'ContactsTable', {
      partitionKey: {name: 'contactId', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-Contacts`
    });
    this.messagesTable = new Table(this, 'MessagesTable', {
      partitionKey: {name: 'conversationId', type: AttributeType.STRING},
      sortKey: {name: 'timestamp_messageId', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-Messages`
    });
    this.voiceMemoryTable = new Table(this, 'VoiceMemoryTable', {
      partitionKey: {name: 'memoryId', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-VoiceMemory`,
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.pendingRepliesTable = new Table(this, 'PendingRepliesTable', {
      partitionKey: {name: 'conversationId', type: AttributeType.STRING},
      sortKey: {name: 'createdAt_messageId', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-PendingReplies`
    });
    this.idempotencyTable = new Table(this, 'IdempotencyTable', {
      partitionKey: {name: 'messageId', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-Idempotency`
    });
  }
}
