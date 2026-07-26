import { GROUPABLE_CHARS } from "../constants/gameConstants";
import type { CharacterGrid as CharacterGridType } from "../types";
import type { CSSProperties } from "react";

interface CharacterGridProps {
  grid: CharacterGridType;
  currentPosition: { x: number; y: number };
}

export const CharacterGrid = ({ grid, currentPosition }: CharacterGridProps) => {
  const getGroupedCells = () => {
    const cells: {
      char: string;
      x: number[];
      y: number;
      width: number;
    }[] = [];

    grid.grid.forEach((char) => {
      const existingGroup = GROUPABLE_CHARS.includes(char.char)
        ? cells.find((cell) => cell.char === char.char && cell.y === char.y)
        : undefined;

      if (existingGroup) {
        existingGroup.x.push(char.x);
        existingGroup.width++;
      } else {
        cells.push({
          char: char.char,
          x: [char.x],
          y: char.y,
          width: 1,
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
              className={`character-cell ${isActive ? "active" : ""}`}
              style={{
                aspectRatio: `${cell.width} / 1`,
                gridColumn: `${cell.x[0] + 1} / span ${cell.width}`,
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
