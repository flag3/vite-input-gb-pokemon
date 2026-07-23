import type { CharacterGrid, CharacterPosition, InputAction } from "../types";
import { getSpacePositions } from "./gridPositions";
import { findShortestPath } from "./pathfinderUtils";

/**
 * 最適なスペース位置を見つける
 */
export const findOptimalSpacePosition = (
  currentPosition: CharacterPosition,
  nextCharPosition: CharacterPosition | null,
  currentIsHiragana: boolean,
  grid: CharacterGrid,
  inputCharCount?: number,
): {
  position: CharacterPosition;
  actions: InputAction[];
  totalSteps: number;
} => {
  const spacePositions = getSpacePositions(grid.version);

  if (spacePositions.hiraganaSpaces.length === 0 && spacePositions.katakanaSpaces.length === 0) {
    return {
      position: { char: "　", x: currentPosition.x, y: currentPosition.y },
      actions: ["A"],
      totalSteps: 1,
    };
  }

  let minTotalSteps = Infinity;
  let optimalPosition = spacePositions.hiraganaSpaces[0] || spacePositions.katakanaSpaces[0];
  let optimalActions: InputAction[] = [];

  // 現在のモードのスペースはそのまま、他のモードのスペースは "s"（モード切替）を先頭に付けて試す
  const candidates: { spaces: CharacterPosition[]; prefix: InputAction[] }[] = [
    {
      spaces: currentIsHiragana ? spacePositions.hiraganaSpaces : spacePositions.katakanaSpaces,
      prefix: [],
    },
    {
      spaces: currentIsHiragana ? spacePositions.katakanaSpaces : spacePositions.hiraganaSpaces,
      prefix: ["s"],
    },
  ];

  for (const { spaces, prefix } of candidates) {
    for (const spacePos of spaces) {
      const actions: InputAction[] = [...prefix];

      if (currentPosition.x !== spacePos.x || currentPosition.y !== spacePos.y) {
        actions.push(...findShortestPath(currentPosition, spacePos, grid, inputCharCount));
      }

      actions.push("A");

      let totalSteps = actions.length;

      if (nextCharPosition) {
        totalSteps += findShortestPath(spacePos, nextCharPosition, grid, inputCharCount).length;
      }

      if (totalSteps < minTotalSteps) {
        minTotalSteps = totalSteps;
        optimalPosition = spacePos;
        optimalActions = actions;
      }
    }
  }

  return {
    position: optimalPosition,
    actions: optimalActions,
    totalSteps: minTotalSteps,
  };
};
