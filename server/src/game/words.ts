// server/src/game/words.ts
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const WORD_LENGTH = 5;

function loadWordList(filename: string): string[] {
  const filepath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filepath, 'utf-8');
  return raw
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === WORD_LENGTH && /^[a-z]+$/.test(w));
}

// Load once, at module-load time. Both lists fit comfortably in memory.
const answers: string[] = loadWordList('answers.txt');
const validGuessesArr: string[] = loadWordList('valid-guesses.txt');

if (answers.length < 100) {
  throw new Error(`answers list too small (${answers.length}); did the file load correctly?`);
}
if (validGuessesArr.length < 100) {
  throw new Error(`valid-guesses list too small (${validGuessesArr.length}); did the file load correctly?`);
}

// Set provides O(1) membership checks for guess validation.
// Union with answers ensures any answer is also a valid guess.
const validGuesses: Set<string> = new Set([...validGuessesArr, ...answers]);

console.log(
  `[words] loaded ${answers.length} answers, ${validGuesses.size} valid guesses`,
);

export function pickRandomAnswer(): string {
  const i = Math.floor(Math.random() * answers.length);
  return answers[i];
}

export function isValidGuess(word: string): boolean {
  return validGuesses.has(word.toLowerCase());
}

export const WORD_CONFIG = {
  length: WORD_LENGTH,
} as const;