import { GROUPABLE_CHARS } from "../constants/gameConstants";
import type { CharacterGrid as CharacterGridType, Position } from "../types";
import type { CSSProperties } from "react";

interface CharacterGridProps {
  grid: CharacterGridType;
  currentPosition: Position;
}

export const CharacterGrid = ({ grid, currentPosition }: CharacterGridProps) => {
  const getGroupedCells = () => {
    const cells: {
      char: string;
      x: number[];
      y: number;
    }[] = [];

    grid.grid.forEach((char) => {
      const existingGroup = GROUPABLE_CHARS.includes(char.char)
        ? cells.find((cell) => cell.char === char.char && cell.y === char.y)
        : undefined;

      if (existingGroup) {
        existingGroup.x.push(char.x);
      } else {
        cells.push({
          char: char.char,
          x: [char.x],
          y: char.y,
        });
      }
    });

    return cells;
  };

  const groupedCells = getGroupedCells();

  return (
    <div className="grid-wrapper">
      <div className="grid-container" style={{ "--grid-width": grid.width } as CSSProperties}>
        {groupedCells.map((cell, index) => {
          const isActive = cell.x.includes(currentPosition.x) && cell.y === currentPosition.y;
          return (
            <div
              key={index}
              className={`chip character-cell ${isActive ? "current" : ""}`}
              style={{
                aspectRatio: `${cell.x.length} / 1`,
                gridColumn: `${cell.x[0] + 1} / span ${cell.x.length}`,
              }}
            >
              {cell.char}
            </div>
          );
        })}
      </div>
    </div>
  );
};
