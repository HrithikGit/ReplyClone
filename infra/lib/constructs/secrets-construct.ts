import {Construct} from 'constructs';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';

export class SecretsConstruct extends Construct {
  public readonly whatsappSecrets: Secret;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.whatsappSecrets = new Secret(this, 'WhatsAppSecrets', {
      secretName: 'replyclone/whatsapp',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          WHATSAPP_VERIFY_TOKEN: 'replace',
          WHATSAPP_ACCESS_TOKEN: 'replace',
          WHATSAPP_PHONE_NUMBER_ID: 'replace',
          WHATSAPP_BUSINESS_ACCOUNT_ID: 'replace',
          META_APP_SECRET: 'replace',
          DEEPSEEK_API_KEY: 'replace',
          DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
          DEEPSEEK_MODEL: 'deepseek-chat',
          LLM_PROVIDER: 'deepseek',
          SARVAM_API_KEY: 'replace',
          SARVAM_BASE_URL: 'https://api.sarvam.ai',
          SARVAM_MODEL: 'sarvam-m'
        }),
        generateStringKey: 'PLACEHOLDER'
      }
    });
  }
}
