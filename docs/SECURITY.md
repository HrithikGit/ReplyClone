# Security Practices

## Local Secrets
- Use `.env` to configure local development (copy `.env.example`).
- Do **not** commit `.env` or any credentials.
- Store secrets only in your machine or password manager.

## GitHub Actions / CI
- Define secrets in GitHub repository settings (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `WHATSAPP_ACCESS_TOKEN`).
- Never print secrets to logs; use masked secrets in workflows.

## AWS Secrets Manager
- Store `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `ALLOWLIST_NUMBERS`, and `DEEPSEEK_API_KEY` there.
- Grant `SecretsManagerReadWrite` minimal policies scoped to the secret ARN.
- Rotate secrets every 90 days by updating the secret value and redeploying stacks.

## Key Rotation
- Rotate API tokens by updating Secrets Manager secret value; CDK stack references latest version automatically.
- Redeploy the stack or restart Lambdas if config changes.

## Incident Response (Secret Leak)
1. Revoke the leaked secret (Secrets Manager/WhatsApp panel).
2. Rotate the secret immediately and update infrastructure.
3. Inspect AWS CloudTrail for unauthorized usage.
4. Communicate to stakeholders, document impact, and re-deploy once safe.
