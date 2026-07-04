import { BASE_GRIDS } from "../constants/characterGrids";
import type { CharacterGrid, CharacterPosition, InputAction, Position } from "../types";
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
): { position: CharacterPosition } | null => {
  const { hiragana, katakana } = BASE_GRIDS[grid.version];

  // 現在のモードのグリッドを先に探し、なければ他のモードのグリッドを探す
  const searchOrder = grid.isHiragana ? [hiragana, katakana] : [katakana, hiragana];

  for (const baseGrid of searchOrder) {
    for (let y = 0; y < baseGrid.length; y++) {
      for (let x = 0; x < baseGrid[y].length; x++) {
        const gridChar = baseGrid[y][x];
        if (gridChar === char || HIRAGANA_KATAKANA_MAP[char]?.includes(gridChar)) {
          return { position: { char: gridChar, x, y } };
        }
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
