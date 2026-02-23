# Operations

## Deploying Infra
1. `cd infra && npm install`
2. Set `AWS_PROFILE`/credentials and ensure `WHATSAPP_*` secrets exist in Secrets Manager.
3. `npm run cdk:diff`
4. `npm run cdk:deploy` (requires confirmation) to deploy `MessagingBotStack`.
5. Inspect CDK outputs for webhook URL, queue URL, table names.

## Troubleshooting
- Check CloudWatch logs for `webhook-handler` or `reply-worker`.
- Validate Secrets Manager permissions (Lambda roles read secrets).
- Use `ENABLE_WHATSAPP_SEND=false` to only simulate sends.

## Local Validation
- `cd app && npm install`
- `npm run dev` (local server on :4000).
- Use `/simulate/inbound` to feed messages and confirm guardrail decisions.

