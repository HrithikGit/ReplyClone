import {mockReply} from '../src/adapters/llm/mock';
import {InboundMessage} from '../src/core/types';

test('mock reply structure', () => {
  const result = mockReply({platform: 'whatsapp', senderId: '+1999', messageId: '1', text: 'hi', timestamp: Date.now()} as InboundMessage);
  expect(result.reply_primary).toContain('Hey');
  expect(result.confidence).toBeGreaterThan(0);
});
