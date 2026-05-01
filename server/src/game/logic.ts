// server/src/game/logic.ts
import type { Tile } from '@shared/types';

/**
 * Score a guess against an answer using Wordle's coloring rules.
 *
 * Two-pass algorithm to handle duplicate letters correctly:
 *   Pass 1: mark exact matches as 'correct' and consume those answer positions.
 *   Pass 2: for remaining guess letters, mark 'present' if the letter exists
 *           in any unconsumed answer position (and consume it); otherwise 'absent'.
 *
 * Inputs are normalized to lowercase. Both strings must be the same length.
 */
export function scoreGuess(guess: string, answer: string): Tile[] {
  if (guess.length !== answer.length) {
    throw new Error(
      `scoreGuess: length mismatch (guess=${guess.length}, answer=${answer.length})`,
    );
  }

  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const length = g.length;

  // Track which answer positions have been "used up" by a green or yellow.
  const consumed: boolean[] = new Array(length).fill(false);
  const result: Tile[] = new Array(length);

  // Pass 1: greens.
  for (let i = 0; i < length; i++) {
    if (g[i] === a[i]) {
      result[i] = { letter: g[i], status: 'correct' };
      consumed[i] = true;
    }
  }

  // Pass 2: yellows and grays.
  for (let i = 0; i < length; i++) {
    if (result[i]) continue; // already green

    let foundAt = -1;
    for (let j = 0; j < length; j++) {
      if (!consumed[j] && a[j] === g[i]) {
        foundAt = j;
        break;
      }
    }

    if (foundAt !== -1) {
      result[i] = { letter: g[i], status: 'present' };
      consumed[foundAt] = true;
    } else {
      result[i] = { letter: g[i], status: 'absent' };
    }
  }

  return result;
}

export function isWin(tiles: Tile[]): boolean {
  return tiles.every((t) => t.status === 'correct');
}