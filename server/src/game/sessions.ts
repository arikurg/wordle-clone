// server/src/game/sessions.ts
import { randomUUID } from 'crypto';
import type { GameStatus, Tile } from '@shared/types';
import { pickRandomAnswer, WORD_CONFIG } from './words';

export type GameSession = {
  id: string;
  answer: string;
  guesses: Tile[][];
  status: GameStatus;
  maxGuesses: number;
  createdAt: number;
};

const MAX_GUESSES = 6;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const sessions = new Map<string, GameSession>();

export function createSession(): GameSession {
  const session: GameSession = {
    id: randomUUID(),
    answer: pickRandomAnswer(),
    guesses: [],
    status: 'in_progress',
    maxGuesses: MAX_GUESSES,
    createdAt: Date.now(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function recordGuess(session: GameSession, tiles: Tile[]): void {
  session.guesses.push(tiles);
}

export function updateStatus(session: GameSession, status: GameStatus): void {
  session.status = status;
}

// Periodic cleanup: drop sessions older than the TTL so memory doesn't grow
// unbounded over a long-running deployment. Cheap; runs every hour.
setInterval(() => {
  const now = Date.now();
  let dropped = 0;
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
      dropped++;
    }
  }
  if (dropped > 0) console.log(`[sessions] cleaned up ${dropped} expired sessions`);
}, 60 * 60 * 1000);

// Re-export the constants the routes will need.
export const GAME_CONFIG = {
  maxGuesses: MAX_GUESSES,
  wordLength: WORD_CONFIG.length,
} as const;