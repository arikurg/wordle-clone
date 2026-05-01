// server/src/routes/game.ts
import { Router, Request, Response } from 'express';
import type {
  StartGameResponse,
  GuessRequest,
  GuessResponse,
  AnswerResponse,
  ErrorResponse,
} from '@shared/types';
import { scoreGuess, isWin } from '../game/logic';
import { isValidGuess } from '../game/words';
import {
  createSession,
  getSession,
  recordGuess,
  updateStatus,
  GAME_CONFIG,
} from '../game/sessions';

export const gameRouter = Router();

/** Small helper to keep error responses consistent. */
function sendError(res: Response, status: number, code: string, message: string) {
  const body: ErrorResponse = { error: { code, message } };
  res.status(status).json(body);
}

// POST /api/game — start a new game
gameRouter.post('/', (_req: Request, res: Response) => {
  const session = createSession();
  const body: StartGameResponse = {
    gameId: session.id,
    maxGuesses: session.maxGuesses,
    wordLength: GAME_CONFIG.wordLength,
    guessesRemaining: session.maxGuesses - session.guesses.length,
    status: session.status,
  };
  res.status(201).json(body);
});

// GET /api/game/:id — read current state (without revealing the answer)
gameRouter.get('/:id', (req: Request<{id : string}>, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return sendError(res, 404, 'GAME_NOT_FOUND', 'No game with that id.');
  }
  res.json({
    gameId: session.id,
    status: session.status,
    guesses: session.guesses,
    guessesRemaining: session.maxGuesses - session.guesses.length,
    maxGuesses: session.maxGuesses,
    wordLength: GAME_CONFIG.wordLength,
  });
});

// POST /api/game/:id/guess — submit a guess
gameRouter.post('/:id/guess', (req: Request<{ id: string }, unknown, GuessRequest>, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return sendError(res, 404, 'GAME_NOT_FOUND', 'No game with that id.');
  }
  if (session.status !== 'in_progress') {
    return sendError(res, 409, 'GAME_OVER', 'This game has already ended.');
  }

  const guessRaw = req.body?.guess;
  if (typeof guessRaw !== 'string') {
    return sendError(res, 400, 'INVALID_INPUT', 'Body must include a string "guess".');
  }
  const guess = guessRaw.trim().toLowerCase();

  if (guess.length !== GAME_CONFIG.wordLength || !/^[a-z]+$/.test(guess)) {
    return sendError(
      res, 400, 'INVALID_LENGTH',
      `Guess must be ${GAME_CONFIG.wordLength} letters (a–z).`,
    );
  }
  if (!isValidGuess(guess)) {
    return sendError(res, 400, 'NOT_IN_WORD_LIST', `"${guess}" isn't in the word list.`);
  }

  const tiles = scoreGuess(guess, session.answer);
  recordGuess(session, tiles);

  if (isWin(tiles)) {
    updateStatus(session, 'won');
  } else if (session.guesses.length >= session.maxGuesses) {
    updateStatus(session, 'lost');
  }

  const body: GuessResponse = {
    result: tiles,
    guessesRemaining: session.maxGuesses - session.guesses.length,
    status: session.status,
    answer: session.status !== 'in_progress' ? session.answer : undefined,
  };
  res.json(body);
});

// GET /api/game/:id/answer — reveal the secret word
gameRouter.get('/:id/answer', (req: Request<{id : string}>, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return sendError(res, 404, 'GAME_NOT_FOUND', 'No game with that id.');
  }
  const body: AnswerResponse = {
    gameId: session.id,
    answer: session.answer,
    status: session.status,
  };
  res.json(body);
});
