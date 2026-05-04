# Definitely not Wordle

A fullstack Wordle clone built for the GoLinks 2026 internship application.

**Live demo:** https://wordle-clone-sand.vercel.app
**Backend API:** https://wordle-clone-server.onrender.com

> **Note:** the API is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after a quiet period takes ~30 seconds while the server boots; subsequent requests are fast.

## Stack

- **Frontend:** React + TypeScript, Vite, plain CSS
- **Backend:** Node + Express + TypeScript, Vitest for unit tests
- **Hosting:** Vercel (client), Render (server)
- **Shared types:** a `shared/` workspace imported by both sides for compile-time API contract enforcement

## Architecture

The project is a monorepo with three folders:

```
wordle-clone/
├── shared/        # types imported by both client and server
├── server/        # Express API
└── client/        # React app (Vite)
```

The single most important architectural decision was that **the backend owns the secret word and game state**. The client only knows its session ID; it learns the answer when the game ends or when it explicitly hits the get-answer endpoint. This is what gives the get-answer endpoint actual meaning, and it's what prevents anyone from pulling the answer out of DevTools.

Game sessions live in a `Map<string, GameSession>` on the server, keyed by a UUID. Sessions older than 24 hours are swept on a periodic interval. This is intentionally ephemeral — adding a database for session state would be over-engineering for the project's scope. A production version would persist sessions in Redis keyed by a cookie.

### API

```
POST   /api/game              → start a new game
GET    /api/game/:id          → get current state
POST   /api/game/:id/guess    → submit a guess
GET    /api/game/:id/answer   → reveal the secret word
```

Errors share a single envelope shape (`{ error: { code, message } }`) with codes like `INVALID_LENGTH`, `NOT_IN_WORD_LIST`, `GAME_NOT_FOUND`, and `GAME_OVER`. Status codes follow REST conventions.

### The green/yellow/gray algorithm

The trickiest piece of logic, because the naive implementation is wrong on duplicate letters. With answer `ALLEY` and guess `LLAMA`, only the first two L's should be colored — the third A is gray because the answer has only one A and it's already been "used" by the third tile.

The implementation in `server/src/game/logic.ts` is a two-pass algorithm:

1. Mark every exact-position match as green and consume that answer slot.
2. For each remaining guess letter, mark yellow if the letter exists in any unconsumed answer slot (and consume it); otherwise gray.

Unit tests in `logic.test.ts` cover the duplicate-letter cases that catch naive implementations.

### Word lists

Two word lists are bundled with the server:

- **answers.txt** — the original Wordle answer list (~2,300 common, recognizable words). Drawn at random as the secret.
- **valid-guesses.txt** — the union of answers and Wordle's allowed-guess list (~13,000 words). Used to validate guesses are real words.

Both lists are bundled rather than fetched from a third-party API to avoid runtime network dependencies and rate limits.

## A note on the spec

The project brief had a small inconsistency: the body text described "5 tries," while the screenshot showed the classic 6-try Wordle grid and the requirement list next to the image specified 6. I went with **6 tries** to match real Wordle and the more recent-looking screenshot. The number lives in a single constant on the server (`MAX_GUESSES`) and is sent to the client in the start-game response, so changing it is a one-line edit.

## Running locally

Requirements: Node 20+, npm.

```bash
# Install
cd server && npm install
cd ../client && npm install

# Run (two terminals)
cd server && npm run dev    # API on :3001
cd client && npm run dev    # web on :5173
```

Run the server tests with `npm test` from inside `server/`.

The client expects a `client/.env` file with:

```
VITE_API_URL=http://localhost:3001
```

## Future work

The scope was deliberately constrained for the take-home. Concrete things I'd add next:

- **Persistent sessions.** Store the game ID in a cookie and persist sessions in Redis so a refresh resumes the in-progress game. Currently a refresh starts a new game.
- **Tile-flip and shake animations.** A first pass exists in the git history; I reverted it to ship a clean, working version and would refine it before merging.
- **Real accessibility pass.** The `aria-live` message slot is in place, but the keyboard buttons need better focus management and the tile colors should pass WCAG contrast in colorblind modes.
- **Daily mode.** Same answer for everyone for 24 hours, which is what makes real Wordle social.
