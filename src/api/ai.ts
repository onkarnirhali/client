import { request } from './http';

export async function rephraseDescription(description: string): Promise<string> {
  const body = { description };
  const res = await request<{ rephrased: string }>('/ai/rephrase', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.rephrased;
}
