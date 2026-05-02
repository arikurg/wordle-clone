// client/src/App.tsx
import { useEffect } from 'react';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { useGame } from './hooks/useGame';
import './App.css';

export default function App() {
  const game = useGame();

  // Physical keyboard support — same actions as the on-screen keyboard.
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
      <header className="header">
        <h1>Definitely not Wordle</h1>
      </header>

      {/* The error message slot stays in the layout even when empty so the
          board doesn't jump around when an error flashes. */}
      <div className="message" role="status" aria-live="polite">
        {game.error}
      </div>

      <Board board={game.board} />

      {(game.status === 'won' || game.status === 'lost') && (
        <div className="result">
          <p>
            {game.status === 'won' ? 'You got it! 🎉' : `Better luck next time.`}
          </p>
          {game.answer && <p>The word was <strong>{game.answer.toUpperCase()}</strong></p>}
          <button className="play-again" onClick={game.restart} type="button">
            Play again
          </button>
        </div>
      )}

      <Keyboard
        board={game.board}
        onLetter={game.type}
        onEnter={game.submit}
        onBackspace={game.backspace}
      />
    </main>
  );
}