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
  const buildMoveActions = (from: CharacterPosition, to: CharacterPosition): InputAction[] => {
    return [...findShortestPath(from, to, grid), "A"];
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

    return buildMoveActions(startPosition, targetPosition);
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
      const nextTarget = findCharacterPosition(nextChar, { ...grid, isHiragana: modes[index + 1] });
      if (nextTarget) {
        nextCharPosition = nextTarget.position;
      }
    }

    const { position: optimalSpacePosition, actions: optimalActions } = findOptimalSpacePosition(
      currentPosition,
      nextCharPosition,
      currentIsHiragana,
      grid,
    );

    const chosenActions = applyGen1EdShortcut(
      optimalActions,
      optimalSpacePosition,
      inputCharCount,
      false,
    );
    const nextIsHiragana = chosenActions.includes("s") ? !currentIsHiragana : currentIsHiragana;

    return {
      sequence: {
        char: "　",
        actions: chosenActions,
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
    );

    return {
      sequence: {
        char,
        actions: chosenDakutenActions,
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
  ): InputAction[] => {
    if (grid.version !== "GEN1") return actions;

    const remainingToLimit = MAX_CHAR_LIMITS[grid.version] - inputCharCount;
    if (remainingToLimit < 0 || (skipWhenAtLimit && remainingToLimit === 0)) return actions;

    const fixedPos: CharacterPosition = {
      ...CONFIRM_POSITIONS[grid.version],
      char: targetPosition.char,
    };
    const pressCount = isDakuten ? remainingToLimit : remainingToLimit + 1;
    const moveFromED = findShortestPath(fixedPos, targetPosition, grid);
    const hackActions: InputAction[] = [
      ...Array<InputAction>(pressCount).fill("A"),
      ...Array<InputAction>(pressCount).fill("B"),
      ...moveFromED,
      "A",
    ];

    return hackActions.length < actions.length ? hackActions : actions;
  };
  const buildEndActions = (totalInputChars: number): InputAction[] => {
    const isAtCharLimit = totalInputChars === MAX_CHAR_LIMITS[grid.version];
    return grid.version === "GEN1"
      ? [isAtCharLimit ? "A" : "S"]
      : !isAtCharLimit
        ? ["S", "A"]
        : ["A"];
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
    const target = findCharacterPosition(currentChar, { ...grid, isHiragana: targetMode });
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
    const directActions = buildMoveActions(currentPosition, targetPosition);

    // GEN1かつ5文字目または4文字目で連続文字の場合にED→削除ハックを検討
    const chosenActions = applyGen1EdShortcut(
      directActions,
      targetPosition,
      inputCharCount,
      isDakutenChar(text[i - 1]),
    );

    currentActions.push(...chosenActions);

    sequences.push({
      char: currentChar,
      actions: currentActions,
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
    sequences.push({
      char: "END",
      actions: buildEndActions(inputCharCount),
    });
  }

  return sequences;
};
