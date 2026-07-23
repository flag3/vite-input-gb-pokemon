import { CONFIRM_POSITIONS, MAX_CHAR_LIMITS, isDakutenChar } from "../constants/gameConstants";
import type { CharacterGrid, CharacterPosition, InputAction, InputPath } from "../types";
import { findCharacterPosition, findShortestPath } from "./pathfinderUtils";
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
  const resolveTargetPosition = (char: string, targetMode: boolean) => {
    const hiraganaResult = findCharacterPosition(char, hiraganaGrid);
    const katakanaResult = findCharacterPosition(char, katakanaGrid);
    if (!hiraganaResult && !katakanaResult) return null;

    const targetIsHiragana = Boolean(hiraganaResult && (!katakanaResult || targetMode));

    return {
      position: targetIsHiragana ? hiraganaResult!.position : katakanaResult!.position,
      isHiragana: targetIsHiragana,
    };
  };
  const buildMoveActions = (
    from: CharacterPosition,
    to: CharacterPosition,
    inputCharCount: number,
  ): InputAction[] => {
    return [...findShortestPath(from, to, grid, inputCharCount), "A"];
  };
  const buildDakutenActions = (
    currentPosition: CharacterPosition,
    targetPosition: CharacterPosition,
    inputCharCount: number,
  ): InputAction[] => {
    const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];
    const startPosition = isAtCharLimit
      ? {
          ...CONFIRM_POSITIONS[grid.version],
          char: currentPosition.char,
        }
      : currentPosition;

    return buildMoveActions(startPosition, targetPosition, inputCharCount);
  };
  const buildSpaceSequence = (
    index: number,
    currentPosition: CharacterPosition,
    currentIsHiragana: boolean,
    inputCharCount: number,
  ): {
    sequence: InputPath;
    position: CharacterPosition;
    isHiragana: boolean;
  } => {
    let nextCharPosition: CharacterPosition | null = null;
    const nextChar = text[index + 1];
    if (index + 1 < text.length && !isDakutenChar(nextChar)) {
      const nextTarget = resolveTargetPosition(nextChar, modes[index + 1]);
      if (nextTarget) {
        nextCharPosition = nextTarget.position;
      }
    }

    const { position: optimalSpacePosition, actions: optimalActions } = findOptimalSpacePosition(
      currentPosition,
      nextCharPosition,
      currentIsHiragana,
      grid,
      inputCharCount,
    );

    const spaceShortcut = applyGen1EdShortcut(
      optimalActions,
      optimalSpacePosition,
      inputCharCount,
      false,
    );
    const chosenActions = spaceShortcut.actions;
    const chosenTotalSteps = spaceShortcut.totalSteps;
    const nextIsHiragana = chosenActions.includes("s") ? !currentIsHiragana : currentIsHiragana;

    return {
      sequence: {
        char: "　",
        actions: chosenActions,
        totalSteps: grid.version === "GEN2_MAIL" ? chosenActions.length : chosenTotalSteps,
      },
      position: optimalSpacePosition,
      isHiragana: nextIsHiragana,
    };
  };
  const buildDakutenSequence = (
    char: string,
    currentPosition: CharacterPosition,
    inputCharCount: number,
  ): { sequence: InputPath; position: CharacterPosition } | null => {
    const dakutenResult = findCharacterPosition(char, grid);
    if (!dakutenResult) return null;
    const normalActions = buildDakutenActions(
      currentPosition,
      dakutenResult.position,
      inputCharCount,
    );
    const chosenDakutenActions = applyGen1EdShortcut(
      normalActions,
      dakutenResult.position,
      inputCharCount,
      true,
      true,
    ).actions;

    return {
      sequence: {
        char,
        actions: chosenDakutenActions,
        totalSteps: chosenDakutenActions.length,
      },
      position: dakutenResult.position,
    };
  };
  // GEN1限定: ED上でA連打→B削除で入力位置を稼ぐショートカットが直行より短ければ採用
  const applyGen1EdShortcut = (
    actions: InputAction[],
    targetPosition: CharacterPosition,
    inputCharCount: number,
    skipWhenAtLimit: boolean,
    isDakuten = false,
  ): { actions: InputAction[]; totalSteps: number } => {
    const noChange = { actions, totalSteps: actions.length };
    if (grid.version !== "GEN1") return noChange;

    const remainingToLimit = MAX_CHAR_LIMITS[grid.version] - inputCharCount;
    if (remainingToLimit < 0 || (skipWhenAtLimit && remainingToLimit === 0)) return noChange;

    const fixedPos: CharacterPosition = {
      ...CONFIRM_POSITIONS[grid.version],
      char: targetPosition.char,
    };
    const pressCount = isDakuten ? remainingToLimit : remainingToLimit + 1;
    const moveFromED = findShortestPath(fixedPos, targetPosition, grid, inputCharCount);
    const hackActions: InputAction[] = [
      ...Array<InputAction>(pressCount).fill("A"),
      ...Array<InputAction>(pressCount).fill("B"),
      ...moveFromED,
      "A",
    ];

    return hackActions.length < actions.length
      ? { actions: hackActions, totalSteps: hackActions.length }
      : noChange;
  };
  const buildEndActions = (
    totalInputChars: number,
  ): { actions: InputAction[]; totalSteps: number } => {
    const isAtCharLimit = totalInputChars === MAX_CHAR_LIMITS[grid.version];
    const actions: InputAction[] =
      grid.version === "GEN1" ? [isAtCharLimit ? "A" : "S"] : !isAtCharLimit ? ["S", "A"] : ["A"];

    return {
      actions,
      totalSteps: grid.version === "GEN1" ? 1 : actions.length,
    };
  };

  const sequences: InputPath[] = [];
  let currentPosition: CharacterPosition = { x: 0, y: 0, char: "" };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    if (isDakutenChar(currentChar)) continue;

    inputCharCount++;

    // スペースの処理
    if (currentChar === "　") {
      const spaceResult = buildSpaceSequence(i, currentPosition, currentIsHiragana, inputCharCount);
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
    const directActions = buildMoveActions(currentPosition, targetPosition, inputCharCount);

    // GEN1かつ5文字目または4文字目で連続文字の場合にED→削除ハックを検討
    const chosenActions = applyGen1EdShortcut(
      directActions,
      targetPosition,
      inputCharCount,
      isDakutenChar(text[i - 1]),
    ).actions;

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
      const dakutenSequence = buildDakutenSequence(nextChar, currentPosition, inputCharCount);
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
