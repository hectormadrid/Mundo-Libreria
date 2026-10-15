import type { Session } from './types';

const API_BASE = `${import.meta.env.BASE_URL}api`;

let csrfToken = '';

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/** Llama a la API PHP. Devuelve el campo `data` o lanza ApiError con el mensaje del servidor. */
export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (method !== 'GET') {
    if (!csrfToken) {
      await fetchSession();
    }
    headers['X-CSRF-Token'] = csrfToken;
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, credentials: 'same-origin' });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }

  const json = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new ApiError(json?.error ?? 'Ocurrió un error inesperado.', response.status);
  }
  return json?.data as T;
}

export async function fetchSession(): Promise<Session> {
  const session = await api<Session>('/auth/session');
  setCsrfToken(session.csrfToken);
  return session;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
