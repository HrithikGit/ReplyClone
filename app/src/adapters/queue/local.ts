import {ReplyJob} from '../../core/types';
import {promises as fs} from 'fs';
import path from 'path';

const queuePath = path.join(__dirname, '../../../local-queue.json');

export const enqueue = async (job: ReplyJob) => {
  await fs.appendFile(queuePath, JSON.stringify(job) + '\n');
};

export const dequeue = async (): Promise<ReplyJob | null> => {
  try {
    const data = await fs.readFile(queuePath, 'utf8');
    const lines = data.trim().split('\n');
    if (!lines.length) return null;
    const job = JSON.parse(lines[0]) as ReplyJob;
    await fs.writeFile(queuePath, lines.slice(1).join('\n'));
    return job;
  } catch {
    return null;
  }
};
