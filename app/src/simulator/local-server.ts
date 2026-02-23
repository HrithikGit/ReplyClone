import express from 'express';
import {enqueue} from '../adapters/queue/local';
import {ReplyJob, InboundMessage} from '../core/types';
import {handleJob} from '../lambdas/reply-worker';
import {saveMessage, loadPendingReplies} from '../adapters/storage/local';
import {v4 as uuidv4} from 'uuid';

const app = express();
app.use(express.json());

app.post('/simulate/inbound', async (req, res) => {
  const inbound: InboundMessage = {
    platform: 'whatsapp',
    senderId: req.body.sender,
    messageId: uuidv4(),
    text: req.body.text,
    timestamp: Date.now()
  };
  await saveMessage(inbound);
  const job: ReplyJob = {inbound, correlationId: uuidv4()};
  await enqueue(job);
  await handleJob(job);
  res.json({jobId: job.correlationId});
});

app.get('/simulate/pending', async (_, res) => {
  const items = await loadPendingReplies();
  res.json(items);
});

app.post('/simulate/send/:id', async (req, res) => {
  const id = req.params.id;
  // Placeholder: mark pending as sent
  res.json({status: 'ok', id});
});

app.listen(4000);
