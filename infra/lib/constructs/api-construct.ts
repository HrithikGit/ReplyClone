import {Construct} from 'constructs';
import {HttpApi, HttpMethod} from 'aws-cdk-lib/aws-apigatewayv2';
import {HttpLambdaIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {Function as LambdaFunction} from 'aws-cdk-lib/aws-lambda';

interface ApiConstructProps {
  readonly webhookHandler: LambdaFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    this.api = new HttpApi(this, 'ReplyCloneApi', {
      apiName: 'ReplyCloneWebhookApi'
    });
    this.api.addRoutes({
      path: '/webhook/whatsapp',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('WebhookIntegration', props.webhookHandler)
    });
  }
}
