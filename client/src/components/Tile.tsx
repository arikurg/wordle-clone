// client/src/components/Tile.tsx
import type { Cell } from '../hooks/useGame';
import './Tile.css';

type TileProps = {
  cell: Cell;
};

export function Tile({ cell }: TileProps) {
  const status = cell?.status ?? 'empty';
  const letter = cell?.letter ?? '';

  return (
    <div className={`tile tile--${status}`} data-letter={letter}>
      {letter.toUpperCase()}
    </div>
  );
}