import {Construct} from 'constructs';
import {aws_opensearchserverless as aoss} from 'aws-cdk-lib';

interface OpenSearchConstructProps {
  readonly name: string;
}

export class OpenSearchConstruct extends Construct {
  public readonly collection: aoss.CfnCollection;
  public readonly collectionName: string;
  public readonly collectionEndpoint: string;

  constructor(scope: Construct, id: string, props: OpenSearchConstructProps) {
    super(scope, id);
    this.collectionName = props.name;

    const encryptionPolicy = new aoss.CfnSecurityPolicy(this, 'EncryptionPolicy', {
      name: `${props.name}-encryption`,
      type: 'encryption',
      policy: JSON.stringify({
        Rules: [{ResourceType: 'collection', Resource: [`collection/${props.name}`]}],
        AWSOwnedKey: true
      })
    });

    const networkPolicy = new aoss.CfnSecurityPolicy(this, 'NetworkPolicy', {
      name: `${props.name}-network`,
      type: 'network',
      policy: JSON.stringify([
        {
          Rules: [
            {ResourceType: 'collection', Resource: [`collection/${props.name}`]},
            {ResourceType: 'dashboard', Resource: [`collection/${props.name}`]}
          ],
          AllowFromPublic: true
        }
      ])
    });

    this.collection = new aoss.CfnCollection(this, 'Collection', {
      name: props.name,
      type: 'VECTORSEARCH'
    });

    this.collection.addDependency(encryptionPolicy);
    this.collection.addDependency(networkPolicy);
    this.collectionEndpoint = this.collection.attrCollectionEndpoint;
  }
}
