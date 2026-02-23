# ReplyClone

ReplyClone is the **Reply Like Me** WhatsApp auto-reply engine. It ingests WhatsApp Cloud API webhooks, runs lightweight guardrails, and responds in a Telugu-vibe voice on behalf of allowlisted contacts. The repo includes:

- **Infrastructure**: AWS CDK v2 (TypeScript) stack (`infra/`) that deploys API Gateway, Lambda handlers, SQS queue + DLQ, DynamoDB tables, and secrets.
- **Application**: Lambda handlers, adapters, guardrails, and a local simulator (`app/`) that can run entirely offline.

## Requirements
### Functional
1. Webhook endpoint + verification
2. Message ingestion, storage, queueing
3. Worker enforces guardrails, uses retrieval, and optionally sends replies with allowlist/safety
4. Local/Cloud storage + queue parity
5. Channel adapter pattern for WhatsApp (Instagram placeholder)

### Non-functional
- Safe-by-default: `MODE=local`, `ENABLE_LLM_LIVE=false`, `ENABLE_WHATSAPP_SEND=false`
- Local mocks only unless `MODE=aws`
- Structured JSON logs + correlation IDs
- Configurable tokens, limits, quiet hours, rate limits

## Local Quickstart (Zero billing)
1. `cd app`
2. `npm install`
3. Copy `.env.example` to `.env` and adjust values (local mode defaults).
4. `npm run dev` and POST to `http://localhost:4000/simulate/inbound` with `{ "sender":"+1999555","text":"Hi" }`.
5. Use `GET /simulate/pending` to inspect holds and `POST /simulate/send/:id` to mark as sent.

## Enabling AWS deployment
1. `cd infra` and `npm install`
2. Set AWS credentials with `aws configure` or env vars.
3. Update `.env` with AWS values (same repo, used during synth/deploy).
4. `npm run cdk:diff` to inspect changes; `npm run cdk:deploy` with confirmation to deploy.
5. Deploy only when ready; rollback to avoid drift.

## Enabling WhatsApp send
1. Deploy in AWS mode with `ENABLE_WHATSAPP_SEND=true` *and* valid secrets stored in Secrets Manager (see SECURITY.md).
2. Without both the flag and secrets, outbound messages remain mocked.
3. Never commit `.env` or secrets; share via Secrets Manager.

## Cost & Safety Notes
- Local mode does not call AWS or WhatsApp; zero billing by default.
- AWS mode uses DynamoDB + SQS with low throughput (batch size 1, rate limits).
- Guardrails stop sensitive replies and ensure confidence before sending.
- Monitor CloudWatch logs & metrics before enabling outbound messages.

## Enabling Deepseek LLM (AWS only)
1. Set `ENABLE_LLM_LIVE=true` and `LLM_PROVIDER=deepseek`.
2. Store `DEEPSEEK_API_KEY` in Secrets Manager (see SECURITY.md).
3. Optional: override `DEEPSEEK_BASE_URL` and `DEEPSEEK_MODEL` in `.env` or secrets.
4. Local mode always uses mock responses; no network calls are made.
