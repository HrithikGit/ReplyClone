import {Construct} from 'constructs';
import {aws_opensearchserverless as aoss} from 'aws-cdk-lib';

interface OpenSearchAccessPolicyProps {
  readonly name: string;
  readonly collectionName: string;
  readonly principals: string[];
}

export class OpenSearchAccessPolicy extends Construct {
  public readonly policy: aoss.CfnAccessPolicy;

  constructor(scope: Construct, id: string, props: OpenSearchAccessPolicyProps) {
    super(scope, id);
    this.policy = new aoss.CfnAccessPolicy(this, 'AccessPolicy', {
      name: `${props.name}-access`,
      type: 'data',
      policy: JSON.stringify([
        {
          Rules: [
            {
              ResourceType: 'collection',
              Resource: [`collection/${props.collectionName}`],
              Permission: ['aoss:CreateCollectionItems', 'aoss:DescribeCollectionItems', 'aoss:UpdateCollectionItems']
            },
            {
              ResourceType: 'index',
              Resource: [`index/${props.collectionName}/*`],
              Permission: [
                'aoss:CreateIndex',
                'aoss:DeleteIndex',
                'aoss:UpdateIndex',
                'aoss:DescribeIndex',
                'aoss:ReadDocument',
                'aoss:WriteDocument'
              ]
            }
          ],
          Principal: props.principals
        }
      ])
    });
  }
}
