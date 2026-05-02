// client/src/App.tsx
import { useEffect, useState } from 'react';
import { startGame, ApiError } from './api/client';
import type { StartGameResponse } from '@shared/types';
import './App.css';

export default function App() {
  const [game, setGame] = useState<StartGameResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startGame()
      .then(setGame)
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(`API error (${err.code}): ${err.message}`);
        } else {
          setError('Network error — is the backend running?');
        }
      });
  }, []);

  return (
    <main>
      <h1>Definitely not Wordle</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!error && !game && <p>Starting game…</p>}
      {game && (
        <pre style={{ textAlign: 'left' }}>
          {JSON.stringify(game, null, 2)}
        </pre>
      )}
    </main>
  );
}