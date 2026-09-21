import { BASE_GRIDS } from "../constants/characterGrids";
import type { CharacterGrid, CharacterPosition, InputAction } from "../types";
import { calculateNextPosition } from "./gridNavigation";
import { HIRAGANA_KATAKANA_MAP } from "./gridPositions";

/**
 * 文字の位置と、見つかったグリッドの入力モードを返す
 */
export const findCharacterPosition = (
  char: string,
  grid: CharacterGrid,
): { position: CharacterPosition; isHiragana: boolean } | null => {
  // 現在のモードのグリッドを先に探し、なければ他のモードのグリッドを探す
  for (const isHiragana of [grid.isHiragana, !grid.isHiragana]) {
    const baseGrid = BASE_GRIDS[grid.version][isHiragana ? "hiragana" : "katakana"];
    for (let y = 0; y < baseGrid.length; y++) {
      for (let x = 0; x < baseGrid[y].length; x++) {
        const gridChar = baseGrid[y][x];
        if (gridChar === char || HIRAGANA_KATAKANA_MAP[char]?.includes(gridChar)) {
          return { position: { char: gridChar, x, y }, isHiragana };
        }
      }
    }
  }

  return null;
};

/**
 * 2点間の最短経路（キー操作列）をBFSで求める
 */
export const findShortestPath = (
  from: CharacterPosition,
  to: CharacterPosition,
  grid: CharacterGrid,
): InputAction[] => {
  const queue: { position: CharacterPosition; actions: InputAction[] }[] = [
    { position: from, actions: [] },
  ];
  const visited = new Set<string>();
  const directions: InputAction[] = ["↑", "↓", "←", "→"];

  if (grid.version !== "GEN1") {
    directions.push("S");
  }

  visited.add(`${from.x},${from.y}`);

  while (queue.length > 0) {
    const { position, actions } = queue.shift()!;

    if (position.x === to.x && position.y === to.y) {
      return actions;
    }

    for (const direction of directions) {
      const nextPosition = calculateNextPosition(position, direction, grid);
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

  return [];
};
