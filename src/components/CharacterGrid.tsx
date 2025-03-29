import React from 'react';
import { CharacterGrid as CharacterGridType, InputAction } from '../types';

interface CharacterGridProps {
  grid: CharacterGridType;
  currentPosition: { x: number; y: number };
  currentAction: InputAction | null;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ grid, currentPosition, currentAction }) => {
  const groupableChars = ['かな', 'カナ', 'ていせい', 'けってい'];

  const getGroupedCells = () => {
    const cells: {
      char: string;
      x: number[];
      y: number;
      width: number;
    }[] = [];

    grid.grid.forEach((char) => {
      if (groupableChars.includes(char.char)) {
        const existingGroup = cells.find(
          cell => cell.char === char.char && cell.y === char.y
        );

        if (existingGroup) {
          existingGroup.x.push(char.x);
          existingGroup.width++;
        } else {
          cells.push({
            char: char.char,
            x: [char.x],
            y: char.y,
            width: 1
          });
        }
      } else {
        cells.push({
          char: char.char,
          x: [char.x],
          y: char.y,
          width: 1
        });
      }
    });

    return cells;
  };

  const groupedCells = getGroupedCells();

  return (
    <div style={{ position: 'relative' }}>
      <div className="grid-container" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.width}, 40px)`,
        gap: '4px',
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        {groupedCells.map((cell, index) => (
          <div
            key={index}
            style={{
              width: `${cell.width * 40 + (cell.width - 1) * 4}px`,
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: cell.x.includes(currentPosition.x) && cell.y === currentPosition.y
                ? '#2196f3'
                : 'white',
              color: cell.x.includes(currentPosition.x) && cell.y === currentPosition.y
                ? 'white'
                : 'black',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '16px',
              position: 'relative',
              transition: 'background-color 0.2s',
              gridColumn: `${cell.x[0] + 1} / span ${cell.width}`
            }}
          >
            {cell.char}
            {cell.x.includes(currentPosition.x) && cell.y === currentPosition.y && currentAction === 'A' && (
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                animation: 'fadeOut 0.5s forwards'
              }}>
                A
              </div>
            )}
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, 0); }
            to { opacity: 0; transform: translate(-50%, -10px); }
          }
        `}
      </style>
    </div>
  );
}; 
