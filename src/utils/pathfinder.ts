import { CharacterGrid, CharacterPosition, InputAction, InputPath } from '../types';
import { hiraganaGrid, katakanaGrid, twoGenBoxHiraganaGrid, twoGenBoxKatakanaGrid, twoGenMailHiraganaGrid, twoGenMailKatakanaGrid } from '../data/characterGrids';

interface InternalPosition {
  x: number;
  y: number;
  char: string;
}

interface PositionWithActions {
  position: InternalPosition;
  actions: InputAction[];
}

const findCharacterPosition = (char: string, grid: CharacterGrid): { position: CharacterPosition, needsModeChange: boolean } | null => {
  let hiraganaBaseGrid: string[][];
  let katakanaBaseGrid: string[][];

  switch (grid.version) {
    case 'GEN1':
      hiraganaBaseGrid = hiraganaGrid;
      katakanaBaseGrid = katakanaGrid;
      break;
    case 'GEN2_NICKNAME':
      hiraganaBaseGrid = twoGenBoxHiraganaGrid;
      katakanaBaseGrid = twoGenBoxKatakanaGrid;
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

  const hiraganaKatakanaMap: Record<string, string[]> = {
    'り': ['リ'],
    'リ': ['り'],
    'へ': ['ヘ'],
    'ヘ': ['へ']
  };

  const currentGrid = grid.isHiragana ? hiraganaBaseGrid : katakanaBaseGrid;
  for (let y = 0; y < currentGrid.length; y++) {
    for (let x = 0; x < currentGrid[y].length; x++) {
      if (currentGrid[y][x] === char) {
        return {
          position: { char, x, y },
          needsModeChange: false
        };
      }
      if (hiraganaKatakanaMap[char]?.includes(currentGrid[y][x])) {
        return {
          position: { char: currentGrid[y][x], x, y },
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
      if (hiraganaKatakanaMap[char]?.includes(otherGrid[y][x])) {
        return {
          position: { char: otherGrid[y][x], x, y },
          needsModeChange: true
        };
      }
    }
  }

  return null;
};

const getNextPosition = (current: InternalPosition, action: InputAction, grid: CharacterGrid): InternalPosition => {
  const pos = { ...current };

  if (grid.version === 'GEN1') {
    switch (action) {
      case '↑':
        if (pos.y === 0) {
          pos.x = 0;
          pos.y = 6;
        } else {
          pos.y--;
        }
        break;
      case '↓':
        if (pos.y === 6) {
          pos.y = 0;
        } else if (pos.y === 5) {
          pos.x = 0;
          pos.y = 6;
        } else {
          pos.y++;
        }
        break;
      case '←':
        if (pos.y === 6) {
          pos.x = 0;
        } else {
          const currentRow = grid.grid.filter(p => p.y === pos.y);
          const positions = currentRow.map(p => p.x).sort((a, b) => a - b);
          const currentIndex = positions.indexOf(pos.x);
          pos.x = currentIndex === 0 ? positions[positions.length - 1] : positions[currentIndex - 1];
        }
        break;
      case '→':
        if (pos.y === 6) {
          pos.x = 0;
        } else {
          const currentRow = grid.grid.filter(p => p.y === pos.y);
          const positions = currentRow.map(p => p.x).sort((a, b) => a - b);
          const currentIndex = positions.indexOf(pos.x);
          pos.x = currentIndex === positions.length - 1 ? positions[0] : positions[currentIndex + 1];
        }
        break;
    }
  } else {
    switch (action) {
      case '↑':
        if (pos.y === 0) {
          pos.y = 4;
        } else {
          pos.y--;
        }
        break;
      case '↓':
        if (pos.y === 4) {
          pos.y = 0;
        } else {
          pos.y++;
        }
        break;
      case '←':
        if (pos.y === 4) {
          if (grid.version === 'GEN2_MAIL') {
            if (pos.x >= 0 && pos.x <= 5) {
              pos.x = 12;
            } else if (pos.x >= 6 && pos.x <= 11) {
              pos.x = 0;
            } else if (pos.x >= 12 && pos.x <= 17) {
              pos.x = 6;
            }
          } else {
            if (pos.x >= 0 && pos.x <= 4) {
              pos.x = 10;
            } else if (pos.x >= 5 && pos.x <= 9) {
              pos.x = 0;
            } else if (pos.x >= 10 && pos.x <= 14) {
              pos.x = 5;
            }
          }
        } else {
          const currentRow = grid.grid.filter(p => p.y === pos.y);
          const positions = currentRow.map(p => p.x).sort((a, b) => a - b);
          const currentIndex = positions.indexOf(pos.x);
          pos.x = currentIndex === 0 ? positions[positions.length - 1] : positions[currentIndex - 1];
        }
        break;
      case '→':
        if (pos.y === 4) {
          if (grid.version === 'GEN2_MAIL') {
            if (pos.x >= 0 && pos.x <= 5) {
              pos.x = 6;
            } else if (pos.x >= 6 && pos.x <= 11) {
              pos.x = 12;
            } else if (pos.x >= 12 && pos.x <= 17) {
              pos.x = 0;
            }
          } else {
            if (pos.x >= 0 && pos.x <= 4) {
              pos.x = 5;
            } else if (pos.x >= 5 && pos.x <= 9) {
              pos.x = 10;
            } else if (pos.x >= 10 && pos.x <= 14) {
              pos.x = 0;
            }
          }
        } else {
          const row = grid.grid.filter(p => p.y === pos.y);
          const xPositions = row.map(p => p.x).sort((a, b) => a - b);
          const xIndex = xPositions.indexOf(pos.x);
          pos.x = xIndex === xPositions.length - 1 ? xPositions[0] : xPositions[xIndex + 1];
        }
        break;
      case 'S':
        if (grid.version === 'GEN2_MAIL') {
          pos.x = 15;
          pos.y = 4;
        } else {
          pos.x = 14;
          pos.y = 4;
        }
        break;
    }
  }

  return pos;
};

const calculateDistance = (from: InternalPosition, to: InternalPosition, grid: CharacterGrid): { distance: number, actions: InputAction[] } => {
  const queue: PositionWithActions[] = [{ position: from, actions: [] }];
  const visited = new Set<string>();
  const directions: InputAction[] = ['↑', '↓', '←', '→'];

  if (grid.version !== 'GEN1') {
    directions.push('S');
  }

  visited.add(`${from.x},${from.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { position, actions } = current;

    if (position.x === to.x && position.y === to.y) {
      return {
        distance: actions.length,
        actions
      };
    }

    for (const direction of directions) {
      const nextPosition = getNextPosition(position, direction, grid);
      const key = `${nextPosition.x},${nextPosition.y}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          position: nextPosition,
          actions: [...actions, direction]
        });
      }
    }
  }

  return {
    distance: 0,
    actions: []
  };
};

export const findInputSequence = (grid: CharacterGrid, text: string, modes: boolean[]): InputPath[] => {
  const sequences: InputPath[] = [];
  let currentPosition: InternalPosition = { x: 0, y: 0, char: '' };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    const currentActions: InputAction[] = [];

    if (currentChar !== '゛' && currentChar !== '゜') {
      inputCharCount++;

      const hiraganaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: true });
      const katakanaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: false });

      if (!hiraganaResult && !katakanaResult) continue;

      const targetIsHiragana = Boolean(hiraganaResult && (!katakanaResult || targetMode));
      const targetIsKatakana = Boolean(katakanaResult && (!hiraganaResult || !targetMode));

      if ((targetIsHiragana && !currentIsHiragana) || (targetIsKatakana && currentIsHiragana)) {
        currentActions.push('s');
        currentIsHiragana = !currentIsHiragana;
      }

      const targetPosition = targetIsHiragana ? hiraganaResult!.position : katakanaResult!.position;

      const { actions: moveActions } = calculateDistance(currentPosition, targetPosition, grid);
      currentActions.push(...moveActions);
      currentActions.push('A');

      sequences.push({
        char: currentChar,
        actions: currentActions,
        totalSteps: currentActions.length
      });

      currentPosition = targetPosition;

      if (i + 1 < text.length && (text[i + 1] === '゛' || text[i + 1] === '゜')) {
        const dakutenResult = findCharacterPosition(text[i + 1], grid);
        if (dakutenResult) {
          const dakutenActions: InputAction[] = [];

          if ((grid.version === 'GEN1' && inputCharCount === 5) ||
            (grid.version === 'GEN2_NICKNAME' && inputCharCount === 5) ||
            (grid.version === 'GEN2_BOX' && inputCharCount === 8) ||
            (grid.version === 'GEN2_MAIL' && inputCharCount === 32)) {

            let fixedStartPosition: InternalPosition;

            switch (grid.version) {
              case 'GEN1':
                fixedStartPosition = { x: 8, y: 5, char: currentPosition.char };
                break;
              case 'GEN2_NICKNAME':
              case 'GEN2_BOX':
                fixedStartPosition = { x: 14, y: 4, char: currentPosition.char };
                break;
              case 'GEN2_MAIL':
                fixedStartPosition = { x: 15, y: 4, char: currentPosition.char };
                break;
            }

            const { actions: optimizedDakutenActions } = calculateDistance(fixedStartPosition, dakutenResult.position, grid);
            dakutenActions.push(...optimizedDakutenActions);
          } else {
            const { actions: normalDakutenActions } = calculateDistance(currentPosition, dakutenResult.position, grid);
            dakutenActions.push(...normalDakutenActions);
          }

          dakutenActions.push('A');

          sequences.push({
            char: text[i + 1],
            actions: dakutenActions,
            totalSteps: dakutenActions.length
          });

          currentPosition = dakutenResult.position;
          i++;
        }
      }
    }
  }

  if (sequences.length > 0) {
    if (grid.version === 'GEN1') {
      sequences.push({
        char: 'END',
        actions: [inputCharCount === 5 ? 'A' : 'S'],
        totalSteps: 1
      });
    } else if (inputCharCount !== (grid.version === 'GEN2_NICKNAME' ? 5 : grid.version === 'GEN2_BOX' ? 8 : 32)) {
      sequences.push({
        char: 'END',
        actions: ['S', 'A'],
        totalSteps: 2
      });
    } else {
      sequences.push({
        char: 'END',
        actions: ['A'],
        totalSteps: 1
      });
    }
  }

  return sequences;
}; 
