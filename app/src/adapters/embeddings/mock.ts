import {config} from '../../config';

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const mockEmbed = (text: string): number[] => {
  const dims = config.embeddings.dimensions;
  const vector = new Array(dims).fill(0);
  const seed = hash(text);
  for (let i = 0; i < dims; i += 1) {
    const value = Math.sin(seed + i) * 0.5 + 0.5;
    vector[i] = value;
  }
  return vector;
};
