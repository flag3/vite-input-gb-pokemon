import { MAX_CHAR_LIMITS } from "../constants/gameConstants";
import { CharacterGrid, InputAction, InputPath } from "../types";
import { getFixedPositionForDakuten } from "./gridPositions";
import {
  InternalPosition,
  findCharacterPosition,
  calculateDistance,
} from "./pathfinderUtils";
import { findOptimalSpacePosition } from "./spacePathfinder";

/**
 * 入力パスを検索
 * @param grid グリッド情報
 * @param text 入力するテキスト
 * @param modes 各文字のモード（true:ひらがな、false:カタカナ）
 * @returns 入力パス
 */
export const findInputSequence = (
  grid: CharacterGrid,
  text: string,
  modes: boolean[],
): InputPath[] => {
  const hiraganaGrid = { ...grid, isHiragana: true };
  const katakanaGrid = { ...grid, isHiragana: false };
  const isDakutenChar = (char?: string) => char === "゛" || char === "゜";
  const getCharPositions = (char: string) => ({
    hiragana: findCharacterPosition(char, hiraganaGrid),
    katakana: findCharacterPosition(char, katakanaGrid),
  });
  const resolveTargetPosition = (char: string, targetMode: boolean) => {
    const { hiragana: hiraganaResult, katakana: katakanaResult } =
      getCharPositions(char);
    if (!hiraganaResult && !katakanaResult) return null;

    const targetIsHiragana = Boolean(
      hiraganaResult && (!katakanaResult || targetMode),
    );

    return {
      position: targetIsHiragana
        ? hiraganaResult!.position
        : katakanaResult!.position,
      isHiragana: targetIsHiragana,
    };
  };
  const buildMoveActions = (
    from: InternalPosition,
    to: InternalPosition,
    inputCharCount: number,
  ): InputAction[] => {
    const { actions: moveActions } = calculateDistance(
      from,
      to,
      grid,
      inputCharCount,
    );
    return [...moveActions, "A"];
  };
  const buildDakutenActions = (
    currentPosition: InternalPosition,
    targetPosition: InternalPosition,
    inputCharCount: number,
  ): InputAction[] => {
    const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];
    const startPosition = isAtCharLimit
      ? {
          ...getFixedPositionForDakuten(grid.version),
          char: currentPosition.char,
        }
      : currentPosition;

    return buildMoveActions(startPosition, targetPosition, inputCharCount);
  };
  const buildSpaceSequence = (
    index: number,
    currentPosition: InternalPosition,
    currentIsHiragana: boolean,
    inputCharCount: number,
  ): {
    sequence: InputPath;
    position: InternalPosition;
    isHiragana: boolean;
  } => {
    let nextCharPosition: InternalPosition | null = null;
    const nextChar = text[index + 1];
    if (index + 1 < text.length && !isDakutenChar(nextChar)) {
      const nextTarget = resolveTargetPosition(nextChar, modes[index + 1]);
      if (nextTarget) {
        nextCharPosition = nextTarget.position;
      }
    }

    const { position: optimalSpacePosition, actions: optimalActions } =
      findOptimalSpacePosition(
        currentPosition,
        nextCharPosition,
        currentIsHiragana,
        grid,
        inputCharCount,
      );

    const spaceShortcut = applyStandardGen1EdShortcut(
      optimalActions,
      optimalSpacePosition,
      inputCharCount,
      false,
    );
    const chosenActions = spaceShortcut.actions;
    const chosenTotalSteps = spaceShortcut.totalSteps;
    const nextIsHiragana = chosenActions.includes("s")
      ? !currentIsHiragana
      : currentIsHiragana;

    return {
      sequence: {
        char: "　",
        actions: chosenActions,
        totalSteps:
          grid.version === "GEN2_MAIL"
            ? chosenActions.length
            : chosenTotalSteps,
      },
      position: optimalSpacePosition,
      isHiragana: nextIsHiragana,
    };
  };
  const buildDakutenSequence = (
    char: string,
    currentPosition: InternalPosition,
    inputCharCount: number,
  ): { sequence: InputPath; position: InternalPosition } | null => {
    const dakutenResult = findCharacterPosition(char, grid);
    if (!dakutenResult) return null;
    const normalActions = buildDakutenActions(
      currentPosition,
      dakutenResult.position,
      inputCharCount,
    );
    const chosenDakutenActions =
      grid.version === "GEN1"
        ? applyDakutenGen1EdShortcut(
            normalActions,
            dakutenResult.position,
            inputCharCount,
          ).actions
        : normalActions;

    return {
      sequence: {
        char,
        actions: chosenDakutenActions,
        totalSteps: chosenDakutenActions.length,
      },
      position: dakutenResult.position,
    };
  };
  const maybeApplyGen1EdShortcut = (
    actions: InputAction[],
    targetPosition: InternalPosition,
    inputCharCount: number,
    pressCountForRemaining: (remainingToLimit: number) => number | null,
    skipWhenAtLimit: boolean,
  ): { actions: InputAction[]; totalSteps: number } => {
    if (grid.version !== "GEN1") {
      return { actions, totalSteps: actions.length };
    }

    const limit = MAX_CHAR_LIMITS[grid.version];
    const fixedPos: InternalPosition = {
      ...getFixedPositionForDakuten(grid.version),
      char: targetPosition.char,
    };

    const remainingToLimit = limit - inputCharCount;
    if (remainingToLimit >= 0) {
      if (skipWhenAtLimit && remainingToLimit === 0) {
        return { actions, totalSteps: actions.length };
      }
      const pressCount = pressCountForRemaining(remainingToLimit);
      if (pressCount === null) {
        return { actions, totalSteps: actions.length };
      }
      const { actions: moveFromED } = calculateDistance(
        fixedPos,
        targetPosition,
        grid,
        inputCharCount,
      );
      const hackActions: InputAction[] = [
        ...Array.from({ length: pressCount }, () => "A" as InputAction),
        ...Array.from({ length: pressCount }, () => "B" as InputAction),
        ...moveFromED,
        "A",
      ];
      if (hackActions.length < actions.length) {
        return { actions: hackActions, totalSteps: hackActions.length };
      }
    }

    return { actions, totalSteps: actions.length };
  };
  const applyStandardGen1EdShortcut = (
    actions: InputAction[],
    targetPosition: InternalPosition,
    inputCharCount: number,
    skipWhenAtLimit: boolean,
  ): { actions: InputAction[]; totalSteps: number } =>
    maybeApplyGen1EdShortcut(
      actions,
      targetPosition,
      inputCharCount,
      (remaining) => remaining + 1,
      skipWhenAtLimit,
    );
  const applyDakutenGen1EdShortcut = (
    actions: InputAction[],
    targetPosition: InternalPosition,
    inputCharCount: number,
  ): { actions: InputAction[]; totalSteps: number } =>
    maybeApplyGen1EdShortcut(
      actions,
      targetPosition,
      inputCharCount,
      (remaining) => (remaining >= 1 ? remaining : null),
      true,
    );
  const buildEndActions = (
    totalInputChars: number,
  ): { actions: InputAction[]; totalSteps: number } => {
    const isAtCharLimit = totalInputChars === MAX_CHAR_LIMITS[grid.version];
    const actions: InputAction[] =
      grid.version === "GEN1"
        ? [isAtCharLimit ? "A" : "S"]
        : !isAtCharLimit
          ? ["S", "A"]
          : ["A"];

    return {
      actions,
      totalSteps: grid.version === "GEN1" ? 1 : actions.length,
    };
  };

  const sequences: InputPath[] = [];
  let currentPosition: InternalPosition = { x: 0, y: 0, char: "" };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    if (isDakutenChar(currentChar)) continue;

    inputCharCount++;

    // スペースの処理
    if (currentChar === "　") {
      const spaceResult = buildSpaceSequence(
        i,
        currentPosition,
        currentIsHiragana,
        inputCharCount,
      );
      sequences.push(spaceResult.sequence);
      currentPosition = spaceResult.position;
      currentIsHiragana = spaceResult.isHiragana;
      continue;
    }

    // 通常文字の処理
    const target = resolveTargetPosition(currentChar, targetMode);
    if (!target) continue;
    const targetIsHiragana = target.isHiragana;
    const currentActions: InputAction[] = [];

    // モード切替が必要かチェック
    if (targetIsHiragana !== currentIsHiragana) {
      currentActions.push("s");
      currentIsHiragana = !currentIsHiragana;
    }

    const targetPosition = target.position;

    // 移動アクションを追加
    const directActions = buildMoveActions(
      currentPosition,
      targetPosition,
      inputCharCount,
    );

    // GEN1かつ5文字目または4文字目で連続文字の場合にED→削除ハックを検討
    const skipWhenAtLimit =
      grid.version === "GEN1" ? isDakutenChar(text[i - 1]) : false;
    const chosenActions =
      grid.version === "GEN1"
        ? applyStandardGen1EdShortcut(
            directActions,
            targetPosition,
            inputCharCount,
            skipWhenAtLimit,
          ).actions
        : directActions;

    currentActions.push(...chosenActions);

    sequences.push({
      char: currentChar,
      actions: currentActions,
      totalSteps: currentActions.length,
    });

    currentPosition = targetPosition;

    // 次の文字が濁点/半濁点の場合の処理
    const nextChar = text[i + 1];
    if (i + 1 < text.length && isDakutenChar(nextChar)) {
      const dakutenSequence = buildDakutenSequence(
        nextChar,
        currentPosition,
        inputCharCount,
      );
      if (!dakutenSequence) continue;
      sequences.push(dakutenSequence.sequence);
      currentPosition = dakutenSequence.position;
      i++;
    }
  }

  // 最後の確定処理
  if (sequences.length > 0) {
    const { actions: endActions, totalSteps } = buildEndActions(inputCharCount);
    sequences.push({
      char: "END",
      actions: endActions,
      totalSteps,
    });
  }

  return sequences;
};
