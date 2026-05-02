// client/src/components/Board.tsx
import type { Cell } from '../hooks/useGame';
import { Tile } from './Tile';
import './Board.css';

type BoardProps = {
  board: Cell[][];
};

export function Board({ board }: BoardProps) {
  return (
    <div className="board">
      {board.map((row, rowIdx) => (
        <div className="board__row" key={rowIdx}>
          {row.map((cell, colIdx) => (
            <Tile key={colIdx} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}
