import { API_BASE_URL } from '../app/config/env';

export class HttpError extends Error {
  status: number;
  data: unknown;
  code?: string;

  constructor(status: number, message: string, data?: unknown, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

async function doFetch(input: string, init?: RequestInit & { timeoutMs?: number }): Promise<Response> {
  const url = API_BASE_URL ? new URL(input, API_BASE_URL).toString() : input;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs || 10000);
  try {
    return await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: controller.signal,
      ...init,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function request<T>(input: string, init?: RequestInit, retryOn401 = true): Promise<T> {
  let res = await doFetch(input, init);
  if (res.status === 401 && retryOn401) {
    // attempt refresh
    await doFetch('/auth/refresh', { method: 'POST' }).catch(() => undefined);
    res = await doFetch(input, init);
  }
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let data: unknown = undefined;
    let message = '';
    let code: string | undefined;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => undefined);
      if (data && typeof data === 'object') {
        const maybeError = (data as any).error;
        if (maybeError && typeof maybeError === 'object') {
          message = maybeError.message || '';
          if (maybeError.code) code = String(maybeError.code);
        }
        if (!message && 'message' in (data as any)) {
          message = String((data as any).message);
        }
      }
    } else {
      const text = await res.text().catch(() => '');
      data = text;
      message = text;
    }
    if (!message) message = `Request failed: ${res.status}`;
    throw new HttpError(res.status, message, data, code);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}
