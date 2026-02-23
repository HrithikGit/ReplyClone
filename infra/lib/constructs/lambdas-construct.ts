import {Construct} from 'constructs';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {SqsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources';
import {Queue} from 'aws-cdk-lib/aws-sqs';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import path from 'path';

interface LambdasConstructProps {
  readonly queue: Queue;
  readonly messagesTableName: string;
  readonly pendingRepliesTableName: string;
  readonly contactsTableName: string;
  readonly secrets: Secret;
}

export class LambdasConstruct extends Construct {
  public readonly webhookHandler: NodejsFunction;
  public readonly replyWorker: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdasConstructProps) {
    super(scope, id);
    const handlerProps = {
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true
      }
    } as const;
    this.webhookHandler = new NodejsFunction(this, 'WebhookHandler', {
      entry: path.join(__dirname, '../../../app/src/lambdas/webhook-handler.ts'),
      ...handlerProps,
      environment: {
        QUEUE_URL: props.queue.queueUrl,
        MODE: 'aws',
        WHATSAPP_VERIFY_TOKEN: props.secrets.secretValueFromJson('WHATSAPP_VERIFY_TOKEN').unsafeUnwrap()
      }
    });
    this.replyWorker = new NodejsFunction(this, 'ReplyWorker', {
      entry: path.join(__dirname, '../../../app/src/lambdas/reply-worker.ts'),
      ...handlerProps,
      environment: {
        QUEUE_URL: props.queue.queueUrl,
        MESSAGES_TABLE: props.messagesTableName,
        PENDING_REPLIES_TABLE: props.pendingRepliesTableName,
        CONTACTS_TABLE: props.contactsTableName,
        WHATSAPP_ACCESS_TOKEN: props.secrets.secretValueFromJson('WHATSAPP_ACCESS_TOKEN').unsafeUnwrap(),
        WHATSAPP_PHONE_NUMBER_ID: props.secrets.secretValueFromJson('WHATSAPP_PHONE_NUMBER_ID').unsafeUnwrap(),
        WHATSAPP_BUSINESS_ACCOUNT_ID: props.secrets.secretValueFromJson('WHATSAPP_BUSINESS_ACCOUNT_ID').unsafeUnwrap(),
        LLM_PROVIDER: props.secrets.secretValueFromJson('LLM_PROVIDER').unsafeUnwrap(),
        DEEPSEEK_API_KEY: props.secrets.secretValueFromJson('DEEPSEEK_API_KEY').unsafeUnwrap(),
        DEEPSEEK_BASE_URL: props.secrets.secretValueFromJson('DEEPSEEK_BASE_URL').unsafeUnwrap(),
        DEEPSEEK_MODEL: props.secrets.secretValueFromJson('DEEPSEEK_MODEL').unsafeUnwrap(),
        SARVAM_API_KEY: props.secrets.secretValueFromJson('SARVAM_API_KEY').unsafeUnwrap(),
        SARVAM_BASE_URL: props.secrets.secretValueFromJson('SARVAM_BASE_URL').unsafeUnwrap(),
        SARVAM_MODEL: props.secrets.secretValueFromJson('SARVAM_MODEL').unsafeUnwrap(),
        MODE: 'aws'
      }
    });
    this.replyWorker.addEventSource(new SqsEventSource(props.queue, {batchSize: 1}));
  }
}
