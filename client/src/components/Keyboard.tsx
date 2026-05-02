// client/src/components/Keyboard.tsx
import { useMemo } from 'react';
import type { Cell } from '../hooks/useGame';
import './Keyboard.css';

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['ENTER','z','x','c','v','b','n','m','BACKSPACE'],
];

type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

type KeyboardProps = {
  board: Cell[][];
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
};

/**
 * Pick the "best" status for each letter that's appeared on the board.
 * Priority: correct > present > absent. Once a key is correct, nothing downgrades it.
 */
function computeKeyStatuses(board: Cell[][]): Record<string, KeyStatus> {
  const rank: Record<KeyStatus, number> = { unused: 0, absent: 1, present: 2, correct: 3 };
  const result: Record<string, KeyStatus> = {};

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.status === 'pending') continue;
      const current = result[cell.letter] ?? 'unused';
      if (rank[cell.status] > rank[current]) {
        result[cell.letter] = cell.status;
      }
    }
  }
  return result;
}

export function Keyboard({ board, onLetter, onEnter, onBackspace }: KeyboardProps) {
  // Recompute only when the board changes.
  const keyStatuses = useMemo(() => computeKeyStatuses(board), [board]);

  function handleClick(key: string) {
    if (key === 'ENTER') onEnter();
    else if (key === 'BACKSPACE') onBackspace();
    else onLetter(key);
  }

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIdx) => (
        <div className="keyboard__row" key={rowIdx}>
          {row.map((key) => {
            const isAction = key === 'ENTER' || key === 'BACKSPACE';
            const status = isAction ? 'unused' : keyStatuses[key] ?? 'unused';
            return (
              <button
                key={key}
                className={`key key--${status} ${isAction ? 'key--action' : ''}`}
                onClick={() => handleClick(key)}
                type="button"
              >
                {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'Enter' : key.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}