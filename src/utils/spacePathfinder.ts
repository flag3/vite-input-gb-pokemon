import { CharacterGrid, CharacterPosition, InputAction } from "../types";
import { getSpacePositions } from "./gridPositions";
import { InternalPosition, calculateDistance } from "./pathfinderUtils";

/**
 * 最適なスペース位置を見つける
 */
export const findOptimalSpacePosition = (
  currentPosition: InternalPosition,
  nextCharPosition: InternalPosition | null,
  currentIsHiragana: boolean,
  grid: CharacterGrid,
  inputCharCount?: number,
): { position: CharacterPosition; actions: InputAction[]; totalSteps: number } => {
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

  // 現在のモードのスペースを試す
  const currentModeSpaces = currentIsHiragana ? spacePositions.hiraganaSpaces : spacePositions.katakanaSpaces;
  for (const spacePos of currentModeSpaces) {
    const actions: InputAction[] = [];

    if (currentPosition.x !== spacePos.x || currentPosition.y !== spacePos.y) {
      const { actions: moveActions } = calculateDistance(currentPosition, spacePos, grid, inputCharCount);
      actions.push(...moveActions);
    }

    actions.push("A");

    let totalSteps = actions.length;

    if (nextCharPosition) {
      const spaceToNextPosition: InternalPosition = {
        x: spacePos.x,
        y: spacePos.y,
        char: "　",
      };

      const { distance: nextDistance } = calculateDistance(spaceToNextPosition, nextCharPosition, grid, inputCharCount);

      totalSteps += nextDistance;
    }

    if (totalSteps < minTotalSteps) {
      minTotalSteps = totalSteps;
      optimalPosition = spacePos;
      optimalActions = actions;
    }
  }

  // 他のモードのスペースも試す
  const otherModeSpaces = currentIsHiragana ? spacePositions.katakanaSpaces : spacePositions.hiraganaSpaces;
  for (const spacePos of otherModeSpaces) {
    const actions: InputAction[] = [];

    actions.push("s");

    if (currentPosition.x !== spacePos.x || currentPosition.y !== spacePos.y) {
      const { actions: moveActions } = calculateDistance(currentPosition, spacePos, grid, inputCharCount);
      actions.push(...moveActions);
    }

    actions.push("A");

    let totalSteps = actions.length;

    if (nextCharPosition) {
      const spaceToNextPosition: InternalPosition = {
        x: spacePos.x,
        y: spacePos.y,
        char: "　",
      };

      const { distance: nextDistance } = calculateDistance(spaceToNextPosition, nextCharPosition, grid, inputCharCount);

      totalSteps += nextDistance;
    }

    if (totalSteps < minTotalSteps) {
      minTotalSteps = totalSteps;
      optimalPosition = spacePos;
      optimalActions = actions;
    }
  }

  return {
    position: optimalPosition,
    actions: optimalActions,
    totalSteps: minTotalSteps,
  };
};
