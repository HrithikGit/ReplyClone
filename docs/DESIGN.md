# Design Overview

## End-to-End Flow
1. **WhatsApp webhook** hits `/webhook/whatsapp`.
2. Webhook handler verifies challenge, token, signature (if available).
3. Request normalized to `{ platform, sender_id, message_id, text, timestamp }`.
4. Message stored in `MessagesTable` (DynamoDB) or local JSONL.
5. Job enqueued to SQS/local queue with correlation metadata.
6. Worker polls queue, loads `CONTEXT_LAST_N` most recent messages (from storage).
7. Guardrails check allowlist, quiet hours, rate limits, sensitive topics, and message deduplication.
8. Retrieval scans `VoiceMemoryTable` for match snippets (`RETRIEVAL_TOP_K`).
9. LLM adapter produced structured JSON (mock or placeholder live).
10. Guardrails enforce `confidence`/`safety`: holds go to `PendingReplies`, sends go through WhatsApp adapter if `ENABLE_WHATSAPP_SEND=true`.
11. Replies and logs recorded with correlation IDs.

## Guardrails Logic
- **Allowlist**: compare `sender_id` to `ALLOWLIST_NUMBERS`.
- **Quiet hours**: defined by `QUIET_HOURS_START/END`, restrict send outside window.
- **Rate limiting**: use last hour message count per sender; `RATE_LIMIT_PER_HOUR` default 3.
- **Sensitive topics**: `guardrails.ts` uses keyword matching; if flagged, set `safety=hold`.
- **Confidence threshold**: require `confidence >= 0.65` before sending; else hold.
- **Idempotency**: each inbound `messageId` is recorded in a dedicated table to skip duplicates.

## Data Model
- **ContactsTable**: `contactId`, `label` (friend/family/work), `lastReplyAt`.
- **MessagesTable**: partition `conversationId`, sort `timestamp#messageId`, stores text + direction.
- **VoiceMemoryTable**: `memoryId` + metadata; used by retrieval.
- **PendingRepliesTable**: pending hold replies with metadata for review.
- Local storage mirrors with JSONL/SQLite files keyed likewise.

## Extensibility Plan
- **Channel adapters**: `app/src/adapters/messaging/*` has WhatsApp implementation + Instagram placeholder.
- **LLM adapters**: `mock`, `openai`, `bedrock`. Guardrails interact via shared response schema.
- **Queue/storage**: pluggable interfaces to swap local vs AWS implementations.

## RAG (Embeddings + OpenSearch)
- **Embeddings**: AWS Bedrock Titan embeddings by default in AWS mode; mock embeddings locally.
- **Vector store**: OpenSearch Serverless (VECTORSEARCH collection).
- **Index mapping (required)**:
  - `vector`: `knn_vector` with `dimension=EMBEDDINGS_DIM`
  - `memoryId`, `text`, `tags`
- **Flow**:
  1) Build query from inbound text + recent context
  2) Embed query
  3) kNN search in OpenSearch
  4) Inject top-K snippets into prompt
