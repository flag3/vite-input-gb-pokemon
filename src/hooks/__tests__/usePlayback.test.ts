import { createGrid } from "../../constants/characterGrids";
import type { GameVersion, StateHistory } from "../../types";
import { decomposeTextWithMode, getDisplayText } from "../../utils/characterMapping";
import { findInputSequence } from "../../utils/pathfinder";
import { advanceHistory } from "../usePlayback";
import { describe, test, expect } from "vitest";

const buildSequences = (text: string, version: GameVersion) => {
  const grid = createGrid(version, false);
  const { chars, modes } = decomposeTextWithMode(text, false, version);
  return findInputSequence(grid, chars.join(""), modes);
};

const initialHistory = (): StateHistory[] => [
  { position: { x: 0, y: 0 }, isHiragana: false, charIndex: 0, action: null, inputChar: null },
];

describe("advanceHistory - 履歴からの状態導出", () => {
  test("レンダーを挟まず連続で進めても状態が壊れない（連打の回帰テスト）", () => {
    const sequences = buildSequences("ピカチュウ", "GEN1");

    // ヒ(6ステップ)完了 + ゜の1ステップ目
    let history = initialHistory();
    for (let i = 0; i < 7; i++) {
      history = advanceHistory(history, sequences, "GEN1");
    }

    expect(history.length - 1).toBe(7);
    expect(getDisplayText(history)).toBe("ヒ");

    // カーソルはヒの真下のフにいる
    const grid = createGrid("GEN1", false);
    const fu = grid.grid.find((item) => item.char === "フ")!;
    expect(history[history.length - 1].position).toEqual({ x: fu.x, y: fu.y });
  });

  test("全ステップ消化で入力テキストが完成し、それ以上は進まない", () => {
    const sequences = buildSequences("ピカチュウ", "GEN1");
    const totalSteps = sequences.reduce((sum, seq) => sum + seq.actions.length, 0);

    let history = initialHistory();
    for (let i = 0; i < totalSteps + 5; i++) {
      history = advanceHistory(history, sequences, "GEN1");
    }

    expect(history.length - 1).toBe(totalSteps);
    expect(getDisplayText(history)).toBe("ピカチュウ");
  });
});
