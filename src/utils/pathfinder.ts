import { CharacterGrid, CharacterPosition, InputAction, InputPath } from '../types';
import { hiraganaGrid, katakanaGrid, twoGenBoxHiraganaGrid, twoGenBoxKatakanaGrid, twoGenMailHiraganaGrid, twoGenMailKatakanaGrid } from '../data/characterGrids';

interface InternalPosition {
  x: number;
  y: number;
}

const findCharacterPosition = (char: string, grid: CharacterGrid): { position: CharacterPosition, needsModeChange: boolean } | null => {
  let hiraganaBaseGrid: string[][];
  let katakanaBaseGrid: string[][];

  switch (grid.version) {
    case 'GEN1':
      hiraganaBaseGrid = hiraganaGrid;
      katakanaBaseGrid = katakanaGrid;
      break;
    case 'GEN2_BOX':
      hiraganaBaseGrid = twoGenBoxHiraganaGrid;
      katakanaBaseGrid = twoGenBoxKatakanaGrid;
      break;
    case 'GEN2_MAIL':
      hiraganaBaseGrid = twoGenMailHiraganaGrid;
      katakanaBaseGrid = twoGenMailKatakanaGrid;
      break;
  }

  const currentGrid = grid.isHiragana ? hiraganaBaseGrid : katakanaBaseGrid;
  for (let y = 0; y < currentGrid.length; y++) {
    for (let x = 0; x < currentGrid[y].length; x++) {
      if (currentGrid[y][x] === char) {
        return {
          position: { char, x, y },
          needsModeChange: false
        };
      }
    }
  }

  const otherGrid = grid.isHiragana ? katakanaBaseGrid : hiraganaBaseGrid;
  for (let y = 0; y < otherGrid.length; y++) {
    for (let x = 0; x < otherGrid[y].length; x++) {
      if (otherGrid[y][x] === char) {
        return {
          position: { char, x, y },
          needsModeChange: true
        };
      }
    }
  }

  return null;
};

const getActions = (from: InternalPosition, to: InternalPosition, grid: CharacterGrid): InputAction[] => {
  const actions: InputAction[] = [];
  const current = { ...from };

  if (grid.version !== 'GEN1') {
    if (to.y === 4) {
      if (current.y === 4) {
        const currentRow = grid.grid.filter(pos => pos.y === 4);
        const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
        const targetX = positions[0];

        if (current.x !== targetX) {
          const rightDistance = targetX >= current.x ?
            targetX - current.x :
            (grid.width - current.x) + targetX;

          const leftDistance = targetX <= current.x ?
            current.x - targetX :
            current.x + (grid.width - targetX);

          if (rightDistance <= leftDistance) {
            actions.push(...Array(rightDistance).fill('→'));
          } else {
            actions.push(...Array(leftDistance).fill('←'));
          }
          current.x = targetX;
        }
      } else {
        if (current.y < 4) {
          actions.push(...Array(4 - current.y).fill('↓'));
        } else {
          actions.push(...Array(current.y - 4).fill('↑'));
        }
        current.y = 4;

        const currentRow = grid.grid.filter(pos => pos.y === 4);
        const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
        const targetX = positions[0];

        if (current.x !== targetX) {
          const rightDistance = targetX >= current.x ?
            targetX - current.x :
            (grid.width - current.x) + targetX;

          const leftDistance = targetX <= current.x ?
            current.x - targetX :
            current.x + (grid.width - targetX);

          if (rightDistance <= leftDistance) {
            actions.push(...Array(rightDistance).fill('→'));
          } else {
            actions.push(...Array(leftDistance).fill('←'));
          }
          current.x = targetX;
        }
      }
      return actions;
    }
  }

  while (current.y !== to.y || current.x !== to.x) {
    if (current.y < to.y) {
      actions.push('↓');
      current.y++;
    } else if (current.y > to.y) {
      actions.push('↑');
      current.y--;
    } else {
      const currentRow = grid.grid.filter(pos => pos.y === current.y);
      const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
      const maxX = positions[positions.length - 1];

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

    if (currentChar !== '゛' && currentChar !== '゜') {
      inputCharCount++;

      if (grid.version === 'GEN1' && inputCharCount === 5) {
        const hiraganaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: true });
        const katakanaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: false });

        const targetIsHiragana = hiraganaResult && (!katakanaResult || targetMode);
        const targetIsKatakana = katakanaResult && (!hiraganaResult || !targetMode);

        if ((targetIsHiragana && !currentIsHiragana) || (targetIsKatakana && currentIsHiragana)) {
          currentActions.push('s');
          currentIsHiragana = !currentIsHiragana;
        }

        const result = currentIsHiragana ? hiraganaResult : katakanaResult;
        if (result) {
          const moveActions = getActions(currentPosition, result.position, grid);
          currentActions.push(...moveActions);
          currentActions.push('A');
          currentPosition = { x: 8, y: 5 };
          sequences.push({
            char: currentChar,
            actions: currentActions,
            totalSteps: currentActions.length
          });
          continue;
        }
      } else if (inputCharCount === (grid.version === 'GEN2_BOX' ? 8 : 32)) {
        const hiraganaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: true });
        const katakanaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: false });

        const targetIsHiragana = hiraganaResult && (!katakanaResult || targetMode);
        const targetIsKatakana = katakanaResult && (!hiraganaResult || !targetMode);

        if ((targetIsHiragana && !currentIsHiragana) || (targetIsKatakana && currentIsHiragana)) {
          currentActions.push('s');
          currentIsHiragana = !currentIsHiragana;
        }

        const result = currentIsHiragana ? hiraganaResult : katakanaResult;
        if (result) {
          const moveActions = getActions(currentPosition, result.position, grid);
          currentActions.push(...moveActions);
          currentActions.push('A');

          sequences.push({
            char: currentChar,
            actions: currentActions,
            totalSteps: currentActions.length
          });

          currentPosition = { x: 14, y: 4 };

          if (i + 1 < text.length && (text[i + 1] === '゛' || text[i + 1] === '゜')) {
            const dakutenResult = findCharacterPosition(text[i + 1], grid);
            if (dakutenResult) {
              const dakutenActions = getActions(currentPosition, dakutenResult.position, grid);
              dakutenActions.push('A');

              sequences.push({
                char: text[i + 1],
                actions: dakutenActions,
                totalSteps: dakutenActions.length
              });

              i++;

              sequences.push({
                char: 'END',
                actions: ['A'],
                totalSteps: 1
              });
              break;
            }
          } else {
            sequences.push({
              char: 'END',
              actions: ['A'],
              totalSteps: 1
            });
          }
          break;
        }
      }
    }

    const hiraganaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: true });
    const katakanaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: false });

    const targetIsHiragana = hiraganaResult && (!katakanaResult || targetMode);
    const targetIsKatakana = katakanaResult && (!hiraganaResult || !targetMode);

    if ((targetIsHiragana && !currentIsHiragana) || (targetIsKatakana && currentIsHiragana)) {
      currentActions.push('s');
      currentIsHiragana = !currentIsHiragana;
    }

    const result = currentIsHiragana ? hiraganaResult : katakanaResult;
    if (result) {
      const moveActions = getActions(currentPosition, result.position, grid);
      currentActions.push(...moveActions);
      currentActions.push('A');
      currentPosition = result.position;
    }

    sequences.push({
      char: currentChar,
      actions: currentActions,
      totalSteps: currentActions.length
    });
  }

  if (sequences.length > 0) {
    if (grid.version === 'GEN1') {
      sequences.push({
        char: 'END',
        actions: [inputCharCount === 5 ? 'A' : 'S'],
        totalSteps: 1
      });
    } else if (inputCharCount !== (grid.version === 'GEN2_BOX' ? 8 : 32)) {
      sequences.push({
        char: 'END',
        actions: ['S', 'A'],
        totalSteps: 2
      });
    }
  }

  return sequences;
}; 
