import {promises as fs} from 'fs';
import path from 'path';
import {VoiceMemorySnippet} from '../../core/types';
import {config} from '../../config';

const vectorPath = path.join(__dirname, '../../../local-voice-memory.jsonl');

const cosine = (a: number[], b: number[]) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const localSearch = async (queryVector: number[], topK: number): Promise<VoiceMemorySnippet[]> => {
  try {
    const data = await fs.readFile(vectorPath, 'utf8');
    const entries = data
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    const ranked = entries
      .map((entry) => ({
        score: cosine(queryVector, entry.embedding),
        snippet: {memoryId: entry.memoryId, text: entry.text, tags: entry.tags} as VoiceMemorySnippet
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.snippet);
    return ranked;
  } catch {
    return [];
  }
};

export const localUpsert = async (items: Array<{memoryId: string; text: string; tags?: string[]; embedding: number[]}>) => {
  const lines = items.map((item) => JSON.stringify(item)).join('\n') + '\n';
  await fs.appendFile(vectorPath, lines);
};
