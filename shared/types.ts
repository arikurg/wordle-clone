// shared/types.ts
// Types used by both the client and the server.

export type TileStatus = 'correct' | 'present' | 'absent';

export type Tile = {
  letter: string;
  status: TileStatus;
};

export type GameStatus = 'in_progress' | 'won' | 'lost';

// API request/response shapes — we'll use these in step 4.

export type StartGameResponse = {
  gameId: string;
  maxGuesses: number;
  wordLength: number;
  guessesRemaining: number;
  status: GameStatus;
};

export type GuessRequest = {
  guess: string;
};

export type GuessResponse = {
  result: Tile[];
  guessesRemaining: number;
  status: GameStatus;
  answer?: string; // only included once the game ends
};

export type AnswerResponse = {
  gameId: string;
  answer: string;
  status: GameStatus;
};

export type ErrorResponse = {
  error: { code: string; message: string };
};