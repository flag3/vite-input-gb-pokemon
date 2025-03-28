import React from 'react';
import { CharacterGrid as CharacterGridType, InputAction } from '../types';

interface CharacterGridProps {
  grid: CharacterGridType;
  currentPosition: { x: number; y: number };
  currentAction: InputAction | null;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ grid, currentPosition, currentAction }) => {
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
        {grid.grid.map((char, index) => (
          <div
            key={index}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: currentPosition.x === char.x && currentPosition.y === char.y
                ? '#2196f3'
                : 'white',
              color: currentPosition.x === char.x && currentPosition.y === char.y
                ? 'white'
                : 'black',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '16px',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}
          >
            {char.char}
            {currentPosition.x === char.x && currentPosition.y === char.y && currentAction === 'A' && (
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
