// client/src/api/client.ts
import type {
  StartGameResponse,
  GuessResponse,
  AnswerResponse,
  ErrorResponse,
} from '@shared/types';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Check your .env file.');
}

/**
 * Custom error class so callers can distinguish API errors (with a code) from
 * network errors (no response at all).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Internal: handle a fetch response, throwing on non-2xx with a typed error. */
async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }
  // Try to parse the standard error envelope; fall back to status text.
  let code = 'UNKNOWN';
  let message = res.statusText;
  try {
    const body = (await res.json()) as ErrorResponse;
    code = body.error?.code ?? code;
    message = body.error?.message ?? message;
  } catch {
    // Non-JSON error body — keep the defaults.
  }
  throw new ApiError(res.status, code, message);
}

export async function startGame(): Promise<StartGameResponse> {
  const res = await fetch(`${API_URL}/api/game`, { method: 'POST' });
  return handle<StartGameResponse>(res);
}

export async function submitGuess(
  gameId: string,
  guess: string,
): Promise<GuessResponse> {
  const res = await fetch(`${API_URL}/api/game/${gameId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess }),
  });
  return handle<GuessResponse>(res);
}

export async function getAnswer(gameId: string): Promise<AnswerResponse> {
  const res = await fetch(`${API_URL}/api/game/${gameId}/answer`);
  return handle<AnswerResponse>(res);
}