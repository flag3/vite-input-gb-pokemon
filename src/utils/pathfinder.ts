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
  const sequences: InputPath[] = [];
  let currentPosition: InternalPosition = { x: 0, y: 0, char: "" };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    const currentActions: InputAction[] = [];

    if (currentChar !== "゛" && currentChar !== "゜") {
      inputCharCount++;

      // スペースの処理
      if (currentChar === "　") {
        let nextCharPosition: InternalPosition | null = null;
        if (
          i + 1 < text.length &&
          text[i + 1] !== "゛" &&
          text[i + 1] !== "゜"
        ) {
          const nextChar = text[i + 1];
          const nextMode = modes[i + 1];
          const nextHiraganaResult = findCharacterPosition(nextChar, {
            ...grid,
            isHiragana: true,
          });
          const nextKatakanaResult = findCharacterPosition(nextChar, {
            ...grid,
            isHiragana: false,
          });

          if (nextHiraganaResult || nextKatakanaResult) {
            const nextTargetIsHiragana = Boolean(
              nextHiraganaResult && (!nextKatakanaResult || nextMode),
            );
            const nextTargetPosition = nextTargetIsHiragana
              ? nextHiraganaResult!.position
              : nextKatakanaResult!.position;

            nextCharPosition = nextTargetPosition;
          }
        }

        const {
          position: optimalSpacePosition,
          actions: optimalActions,
          totalSteps,
        } = findOptimalSpacePosition(
          currentPosition,
          nextCharPosition,
          currentIsHiragana,
          grid,
        );

        if (optimalActions.includes("s")) {
          currentIsHiragana = !currentIsHiragana;
        }

        sequences.push({
          char: currentChar,
          actions: optimalActions,
          totalSteps:
            grid.version === "GEN2_MAIL" ? optimalActions.length : totalSteps,
        });

        currentPosition = optimalSpacePosition;
        continue;
      }

      // 通常文字の処理
      const hiraganaResult = findCharacterPosition(currentChar, {
        ...grid,
        isHiragana: true,
      });
      const katakanaResult = findCharacterPosition(currentChar, {
        ...grid,
        isHiragana: false,
      });

      if (!hiraganaResult && !katakanaResult) continue;

      const targetIsHiragana = Boolean(
        hiraganaResult && (!katakanaResult || targetMode),
      );
      const targetIsKatakana = Boolean(
        katakanaResult && (!hiraganaResult || !targetMode),
      );

      // モード切替が必要かチェック
      if (
        (targetIsHiragana && !currentIsHiragana) ||
        (targetIsKatakana && currentIsHiragana)
      ) {
        currentActions.push("s");
        currentIsHiragana = !currentIsHiragana;
      }

      const targetPosition = targetIsHiragana
        ? hiraganaResult!.position
        : katakanaResult!.position;

      // 移動アクションを追加
      const { actions: directMoveActions } = calculateDistance(
        currentPosition,
        targetPosition,
        grid,
        inputCharCount,
      );
      const directActions: InputAction[] = [...directMoveActions, "A"];

      let chosenActions = directActions;

      // GEN1かつ5文字目または4文字目で連続文字の場合にED→削除ハックを検討
      if (grid.version === "GEN1") {
        const limit = MAX_CHAR_LIMITS[grid.version];
        // 5文字目到達時 (最後の文字) のハック
        if (inputCharCount === limit) {
          const prev = text[i - 1];
          if (prev !== "゛" && prev !== "゜") {
            const fixedPos: InternalPosition = {
              ...getFixedPositionForDakuten(grid.version),
              char: currentPosition.char,
            };
            const { actions: moveFromED } = calculateDistance(
              fixedPos,
              targetPosition,
              grid,
              inputCharCount,
            );
            const hack: InputAction[] = ["A", "B", ...moveFromED, "A"];
            if (hack.length < directActions.length) chosenActions = hack;
          }
        }
        if (inputCharCount === limit - 1) {
          const fixedPos: InternalPosition = {
            ...getFixedPositionForDakuten(grid.version),
            char: currentPosition.char,
          };
          const { actions: moveFromED } = calculateDistance(
            fixedPos,
            targetPosition,
            grid,
            inputCharCount,
          );
          const hack: InputAction[] = ["A", "A", "B", "B", ...moveFromED, "A"];
          if (hack.length < directActions.length) chosenActions = hack;
        }
      }

      currentActions.push(...chosenActions);

      sequences.push({
        char: currentChar,
        actions: currentActions,
        totalSteps: currentActions.length,
      });

      currentPosition = targetPosition;

      // 次の文字が濁点/半濁点の場合の処理
      if (
        i + 1 < text.length &&
        (text[i + 1] === "゛" || text[i + 1] === "゜")
      ) {
        const dakutenResult = findCharacterPosition(text[i + 1], grid);
        if (dakutenResult) {
          // 標準ルート: 制限到達時はED起点、未達時は現在位置起点
          const isAtCharLimit =
            inputCharCount === MAX_CHAR_LIMITS[grid.version];
          let normalActions: InputAction[];
          if (isAtCharLimit) {
            const fixedStart: InternalPosition = {
              ...getFixedPositionForDakuten(grid.version),
              char: currentPosition.char,
            };
            const { actions: optActions } = calculateDistance(
              fixedStart,
              dakutenResult.position,
              grid,
              inputCharCount,
            );
            normalActions = [...optActions, "A"];
          } else {
            const { actions: normalMoves } = calculateDistance(
              currentPosition,
              dakutenResult.position,
              grid,
              inputCharCount,
            );
            normalActions = [...normalMoves, "A"];
          }
          // limit-1の場合にED削除ハックを検討
          let chosenDakutenActions = normalActions;
          if (
            grid.version === "GEN1" &&
            inputCharCount === MAX_CHAR_LIMITS[grid.version] - 1
          ) {
            const fixedPos: InternalPosition = {
              ...getFixedPositionForDakuten(grid.version),
              char: currentPosition.char,
            };
            const { actions: hackMoves } = calculateDistance(
              fixedPos,
              dakutenResult.position,
              grid,
              inputCharCount,
            );
            const hackActions: InputAction[] = ["A", "B", ...hackMoves, "A"];
            if (hackActions.length < normalActions.length) {
              chosenDakutenActions = hackActions;
            }
          }
          sequences.push({
            char: text[i + 1],
            actions: chosenDakutenActions,
            totalSteps: chosenDakutenActions.length,
          });
          currentPosition = dakutenResult.position;
          i++;
        }
      }
    }
  }

  // 最後の確定処理
  if (sequences.length > 0) {
    const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];

    if (grid.version === "GEN1") {
      sequences.push({
        char: "END",
        actions: [isAtCharLimit ? "A" : "S"],
        totalSteps: 1,
      });
    } else if (grid.version === "GEN2_MAIL" && !isAtCharLimit) {
      // GEN2_MAILの場合は特別な処理
      const actions: InputAction[] = ["S", "A"];
      sequences.push({
        char: "END",
        actions,
        totalSteps: actions.length, // actionsの長さと同じにする
      });
    } else if (!isAtCharLimit) {
      sequences.push({
        char: "END",
        actions: ["S", "A"],
        totalSteps: 2,
      });
    } else {
      sequences.push({
        char: "END",
        actions: ["A"],
        totalSteps: 1,
      });
    }
  }

  return sequences;
};
