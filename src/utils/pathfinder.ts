import { CharacterGrid, CharacterPosition, InputAction, InputPath } from '../types';
import { GRIDS, hiraganaGrid, katakanaGrid } from '../data/characterGrids';

interface InternalPosition {
  x: number;
  y: number;
}

const findCharacterPosition = (char: string, isHiragana: boolean): CharacterPosition | null => {
  const baseGrid = isHiragana ? hiraganaGrid : katakanaGrid;

  for (let y = 0; y < baseGrid.length; y++) {
    for (let x = 0; x < baseGrid[y].length; x++) {
      if (baseGrid[y][x] === char) {
        return { char, x, y };
      }
    }
  }
  return null;
};

const getActions = (from: InternalPosition, to: InternalPosition): InputAction[] => {
  const actions: InputAction[] = [];
  let current = { ...from };

  if (to.y === 6 && to.x === 0) {
    if (current.y === 0) {
      actions.push('↓');
      current.y = 6;
      current.x = 0;
    } else if (current.y !== 6) {
      if (current.x === 0) {
        actions.push('↓');
        current.y = 6;
      } else {
        const leftMoves = Array(current.x).fill('←') as InputAction[];
        actions.push(...leftMoves);
        actions.push('↓');
        current = { x: 0, y: 6 };
      }
    }
    return actions;
  }

  if (current.y === 6) {
    actions.push('↓');
    current.y = 0;
  }

  while (current.y !== to.y || current.x !== to.x) {
    if (current.y < to.y) {
      actions.push('↓');
      current.y++;
    } else if (current.y > to.y) {
      actions.push('↑');
      current.y--;
    } else {
      const currentRow = GRIDS['GEN1'].grid.filter(pos => pos.y === current.y);
      const maxX = Math.max(...currentRow.map(pos => pos.x));

      const rightDistance = to.x >= current.x ?
        to.x - current.x :
        (maxX + 1 - current.x) + to.x;

      const leftDistance = to.x <= current.x ?
        current.x - to.x :
        current.x + (maxX + 1 - to.x);

      if (rightDistance <= leftDistance) {
        actions.push('→');
        current.x = current.x === maxX ? 0 : current.x + 1;
      } else {
        actions.push('←');
        current.x = current.x === 0 ? maxX : current.x - 1;
      }
    }
  }

  return actions;
};

export const findInputSequence = (grid: CharacterGrid, text: string, modes: boolean[]): InputPath[] => {
  const sequences: InputPath[] = [];
  let currentPosition: InternalPosition = { x: 0, y: 0 };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    const currentActions: InputAction[] = [];

    if (currentIsHiragana !== targetMode) {
      currentActions.push('s' as InputAction);
      currentIsHiragana = targetMode;
    }

    const charPosition = findCharacterPosition(currentChar, currentIsHiragana);
    if (charPosition) {
      if (currentChar !== '゛' && currentChar !== '゜') {
        inputCharCount++;
      }

      if (inputCharCount === 5 && currentChar !== '゛' && currentChar !== '゜') {
        const moveActions = getActions(currentPosition, charPosition);
        currentActions.push(...moveActions);
        currentActions.push('A');
        currentPosition = { x: 8, y: 5 };
      } else if (inputCharCount > 5) {
        const moveActions = getActions(currentPosition, charPosition);
        currentActions.push(...moveActions);
        currentActions.push('A');
        currentPosition = charPosition;
      } else {
        const moveActions = getActions(currentPosition, charPosition);
        currentActions.push(...moveActions);
        currentActions.push('A');
        currentPosition = charPosition;
      }
    }

    sequences.push({
      char: currentChar,
      actions: currentActions,
      totalSteps: currentActions.length
    } as InputPath);
  }

  return sequences;
}; 
