import crypto from 'crypto';

export const verifySignature = (
  headers: Record<string, string | undefined>,
  rawBody: string,
  appSecret: string
): boolean => {
  const signature = headers['x-hub-signature-256'] ?? headers['x-hub-signature'];
  if (!signature) {
    return true;
  }
  if (!appSecret) {
    return false;
  }
  const normalized = signature.replace('sha256=', '');
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected));
};
