// client/src/App.tsx
import { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import './App.css';

export default function App() {
  const game = useGame();

  // Wire keyboard events to the hook for now — a proper on-screen
  // keyboard component comes in step 7.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') game.submit();
      else if (e.key === 'Backspace') game.backspace();
      else if (/^[a-zA-Z]$/.test(e.key)) game.type(e.key);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  return (
    <main>
      <h1>Definitely not Wordle</h1>

      <p>Status: {game.status}</p>
      {game.error && <p style={{ color: 'crimson' }}>{game.error}</p>}
      {game.answer && <p>Answer was: <strong>{game.answer}</strong></p>}

      <pre style={{ textAlign: 'left' }}>
        {game.board
          .map((row) =>
            row
              .map((cell) =>
                cell === null ? '·' : `${cell.letter}[${cell.status[0]}]`,
              )
              .join(' '),
          )
          .join('\n')}
      </pre>

      {(game.status === 'won' || game.status === 'lost') && (
        <button onClick={game.restart}>Play again</button>
      )}
    </main>
  );
}