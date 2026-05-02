// client/src/hooks/useGame.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameStatus, Tile } from '@shared/types';
import { ApiError, startGame, submitGuess } from '../api/client';

const ERROR_FLASH_MS = 1500;

/**
 * Cell shown in the grid. Past rows have a status from the server; the active
 * row's letters have status 'pending' until the row is submitted; empty cells
 * are null.
 */
export type Cell =
  | { letter: string; status: TileStatus | 'pending' }
  | null;

type TileStatus = Tile['status']; // 'correct' | 'present' | 'absent'

export type UseGameResult = {
  // State for the UI to render
  board: Cell[][];                // [maxGuesses][wordLength]
  status: GameStatus | 'loading' | 'error';
  error: string | null;
  answer: string | null;
  isSubmitting: boolean;

  // Actions the UI can call
  type: (letter: string) => void;
  backspace: () => void;
  submit: () => void;
  restart: () => void;
};

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function emptyBoard(): Cell[][] {
  return Array.from({ length: MAX_GUESSES }, () =>
    Array.from({ length: WORD_LENGTH }, () => null),
  );
}

export function useGame(): UseGameResult {
  // Server-owned state
  const [gameId, setGameId] = useState<string | null>(null);
  const [pastRows, setPastRows] = useState<Tile[][]>([]);
  const [status, setStatus] = useState<GameStatus | 'loading' | 'error'>('loading');
  const [answer, setAnswer] = useState<string | null>(null);

  // Local input + UI state
  const [currentGuess, setCurrentGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lets us cancel a pending error-flash timer if the user types again.
  const errorTimerRef = useRef<number | null>(null);

  // Boot: start a game on mount.
  const initGame = useCallback(async () => {
    setStatus('loading');
    setPastRows([]);
    setCurrentGuess('');
    setAnswer(null);
    setError(null);
    try {
      const game = await startGame();
      setGameId(game.gameId);
      setStatus(game.status);
    } catch {
      setStatus('error');
      setError('Could not reach the server. Check your connection.');
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  /** Set an error message that auto-clears after a short flash. */
  const flashError = useCallback((message: string) => {
    setError(message);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => {
      setError(null);
      errorTimerRef.current = null;
    }, ERROR_FLASH_MS);
  }, []);

  // Clean up the timer if the component unmounts mid-flash.
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    };
  }, []);

  const isPlaying = status === 'in_progress';

  const type = useCallback(
    (letter: string) => {
      if (!isPlaying || isSubmitting) return;
      if (!/^[a-zA-Z]$/.test(letter)) return;
      setCurrentGuess((g) => (g.length >= WORD_LENGTH ? g : g + letter.toLowerCase()));
    },
    [isPlaying, isSubmitting],
  );

  const backspace = useCallback(() => {
    if (!isPlaying || isSubmitting) return;
    setCurrentGuess((g) => g.slice(0, -1));
  }, [isPlaying, isSubmitting]);

  const submit = useCallback(async () => {
    if (!isPlaying || isSubmitting || !gameId) return;
    if (currentGuess.length !== WORD_LENGTH) {
      flashError('Not enough letters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitGuess(gameId, currentGuess);
      setPastRows((rows) => [...rows, res.result]);
      setCurrentGuess('');
      setStatus(res.status);
      if (res.answer) setAnswer(res.answer);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_IN_WORD_LIST') {
        flashError('Not in word list');
      } else if (err instanceof ApiError) {
        flashError(err.message);
      } else {
        flashError('Network error — try again');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [gameId, currentGuess, isPlaying, isSubmitting, flashError]);

  // Build the rendered board: past rows from the server, the active row from
  // the live input, and the rest empty.
  const board: Cell[][] = emptyBoard().map((emptyRow, rowIdx) => {
    if (rowIdx < pastRows.length) {
      return pastRows[rowIdx].map((t) => ({ letter: t.letter, status: t.status }));
    }
    if (rowIdx === pastRows.length && isPlaying) {
      return emptyRow.map((_, colIdx) => {
        const letter = currentGuess[colIdx];
        return letter ? { letter, status: 'pending' as const } : null;
      });
    }
    return emptyRow;
  });

  return {
    board,
    status,
    error,
    answer,
    isSubmitting,
    type,
    backspace,
    submit,
    restart: initGame,
  };
}