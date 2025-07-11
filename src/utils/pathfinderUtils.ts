import {
  hiraganaGrid,
  katakanaGrid,
  twoGenBoxHiraganaGrid,
  twoGenBoxKatakanaGrid,
  twoGenMailHiraganaGrid,
  twoGenMailKatakanaGrid,
} from "../data/characterGrids";
import { CharacterGrid, CharacterPosition, InputAction, Position } from "../types";
import { calculateNextPosition } from "./gridNavigation";
import { HIRAGANA_KATAKANA_MAP } from "./gridPositions";

/**
 * 内部で使用する位置情報の型
 */
export interface InternalPosition extends Position {
  char: string;
}

/**
 * 位置と操作の組み合わせの型
 */
interface PositionWithActions {
  position: InternalPosition;
  actions: InputAction[];
}

/**
 * 文字の位置を見つける
 */
export const findCharacterPosition = (
  char: string,
  grid: CharacterGrid,
): { position: CharacterPosition; needsModeChange: boolean } | null => {
  let hiraganaBaseGrid: string[][];
  let katakanaBaseGrid: string[][];

  switch (grid.version) {
    case "GEN1":
      hiraganaBaseGrid = hiraganaGrid;
      katakanaBaseGrid = katakanaGrid;
      break;
    case "GEN2_NICKNAME":
      hiraganaBaseGrid = twoGenBoxHiraganaGrid;
      katakanaBaseGrid = twoGenBoxKatakanaGrid;
      break;
    case "GEN2_BOX":
      hiraganaBaseGrid = twoGenBoxHiraganaGrid;
      katakanaBaseGrid = twoGenBoxKatakanaGrid;
      break;
    case "GEN2_MAIL":
      hiraganaBaseGrid = twoGenMailHiraganaGrid;
      katakanaBaseGrid = twoGenMailKatakanaGrid;
      break;
  }

  // 現在のモードのグリッドから文字を探す
  const currentGrid = grid.isHiragana ? hiraganaBaseGrid : katakanaBaseGrid;
  for (let y = 0; y < currentGrid.length; y++) {
    for (let x = 0; x < currentGrid[y].length; x++) {
      if (currentGrid[y][x] === char) {
        return {
          position: { char, x, y },
          needsModeChange: false,
        };
      }
      if (HIRAGANA_KATAKANA_MAP[char]?.includes(currentGrid[y][x])) {
        return {
          position: { char: currentGrid[y][x], x, y },
          needsModeChange: false,
        };
      }
    }
  }

  // 他のモードのグリッドから文字を探す
  const otherGrid = grid.isHiragana ? katakanaBaseGrid : hiraganaBaseGrid;
  for (let y = 0; y < otherGrid.length; y++) {
    for (let x = 0; x < otherGrid[y].length; x++) {
      if (otherGrid[y][x] === char) {
        return {
          position: { char, x, y },
          needsModeChange: true,
        };
      }
      if (HIRAGANA_KATAKANA_MAP[char]?.includes(otherGrid[y][x])) {
        return {
          position: { char: otherGrid[y][x], x, y },
          needsModeChange: true,
        };
      }
    }
  }

  return null;
};

/**
 * 2点間の最短経路を計算する
 */
export const calculateDistance = (
  from: InternalPosition,
  to: InternalPosition,
  grid: CharacterGrid,
  inputCharCount?: number,
): { distance: number; actions: InputAction[] } => {
  const queue: PositionWithActions[] = [{ position: from, actions: [] }];
  const visited = new Set<string>();
  const directions: InputAction[] = ["↑", "↓", "←", "→"];

  if (grid.version !== "GEN1") {
    directions.push("S");
  }

  visited.add(`${from.x},${from.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { position, actions } = current;

    if (position.x === to.x && position.y === to.y) {
      return {
        distance: actions.length,
        actions,
      };
    }

    for (const direction of directions) {
      const nextPosition = calculateNextPosition(position, direction, grid, inputCharCount);
      const key = `${nextPosition.x},${nextPosition.y}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          position: { ...nextPosition, char: position.char },
          actions: [...actions, direction],
        });
      }
    }
  }

  return {
    distance: 0,
    actions: [],
  };
};
