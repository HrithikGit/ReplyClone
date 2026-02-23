import {Construct} from 'constructs';
import {Duration} from 'aws-cdk-lib';
import {Queue} from 'aws-cdk-lib/aws-sqs';

interface QueueConstructProps {
  readonly queueName: string;
  readonly dlqName: string;
}

export class QueueConstruct extends Construct {
  public readonly queue: Queue;
  public readonly dlq: Queue;

  constructor(scope: Construct, id: string, props: QueueConstructProps) {
    super(scope, id);
    this.dlq = new Queue(this, 'DLQ', {
      queueName: props.dlqName,
      retentionPeriod: Duration.days(14)
    });
    this.queue = new Queue(this, 'MainQueue', {
      queueName: props.queueName,
      deadLetterQueue: {
        queue: this.dlq,
        maxReceiveCount: 3
      },
      visibilityTimeout: Duration.seconds(30)
    });
  }
}
