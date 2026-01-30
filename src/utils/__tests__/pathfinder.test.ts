import { GRIDS } from "../../constants/characterGrids";
import { GameVersion } from "../../types";
import { decomposeTextWithMode } from "../characterMapping";
import { findInputSequence } from "../pathfinder";
import { describe, test, expect } from "vitest";

describe("pathfinder - 入力シーケンス生成", () => {
  const testCases = [
    {
      input: "ピカチュウ",
      version: "GEN1" as GameVersion,
      expectedActions: [
        "↓",
        "←",
        "←",
        "←",
        "←",
        "A",
        "↓",
        "↓",
        "↓",
        "↓",
        "A",
        "↓",
        "↓",
        "→",
        "A",
        "↓",
        "→",
        "→",
        "A",
        "↑",
        "↑",
        "↑",
        "→",
        "A",
        "↑",
        "↑",
        "↑",
        "←",
        "A",
        "A",
      ],
    },
    {
      input: "ツツツツロ",
      version: "GEN1" as GameVersion,
      expectedActions: ["↓", "↓", "→", "→", "→", "A", "A", "A", "A", "A", "B", "↑", "A", "A"],
    },
    {
      input: "ツツツロロ",
      version: "GEN1" as GameVersion,
      expectedActions: [
        "↓",
        "↓",
        "→",
        "→",
        "→",
        "A",
        "A",
        "A",
        "A",
        "A",
        "B",
        "B",
        "↑",
        "A",
        "A",
        "A",
      ],
    },
    {
      input: "キキキギノ",
      version: "GEN1" as GameVersion,
      expectedActions: [
        "↓",
        "→",
        "A",
        "A",
        "A",
        "A",
        "A",
        "B",
        "←",
        "←",
        "←",
        "←",
        "A",
        "↑",
        "A",
        "A",
      ],
    },
    {
      input: "あいうぎろ",
      version: "GEN1" as GameVersion,
      expectedActions: [
        "s",
        "A",
        "↓",
        "A",
        "↓",
        "A",
        "↑",
        "→",
        "A",
        "A",
        "B",
        "←",
        "←",
        "←",
        "←",
        "A",
        "↓",
        "↑",
        "↑",
        "←",
        "A",
        "A",
      ],
    },
    {
      input: "ミュウ",
      version: "GEN2_NICKNAME" as GameVersion,
      expectedActions: [
        "↑",
        "→",
        "↑",
        "↑",
        "→",
        "A",
        "→",
        "→",
        "→",
        "→",
        "→",
        "A",
        "S",
        "↓",
        "→",
        "→",
        "→",
        "A",
        "S",
        "A",
      ],
    },
    {
      input: "コ　サ",
      version: "GEN2_MAIL" as GameVersion,
      expectedActions: ["↑", "←", "↓", "←", "←", "A", "→", "A", "→", "A", "S", "A"],
    },
    {
      input: "９　９",
      version: "GEN2_MAIL" as GameVersion,
      expectedActions: ["s", "S", "↑", "A", "s", "A", "s", "A", "S", "A"],
    },
    {
      input: "123",
      version: "GEN2_MAIL" as GameVersion,
      expectedActions: ["s", "↑", "→", "↑", "A", "→", "A", "→", "A", "S", "A"],
    },
  ];

  testCases.forEach((testCase, index) => {
    test(`ケース #${index + 1}: "${testCase.input}" (${testCase.version})`, () => {
      const { input, version, expectedActions } = testCase;

      const grid = { ...GRIDS[version], isHiragana: false };
      const { chars, modes } = decomposeTextWithMode(input, false, version);

      const sequences = findInputSequence(grid, chars.join(""), modes);
      const actualActions = sequences.flatMap((seq) => seq.actions);
      const actualTotalSteps = sequences.reduce((sum, seq) => sum + seq.totalSteps, 0);
      const expectedSteps = expectedActions.length;

      expect(actualTotalSteps).toBe(expectedSteps);
      expect(actualActions).toEqual(expectedActions);
    });
  });

  test("GEN1: 文字数上限時のスペースはED経由の最短ルートを使う", () => {
    const input = "モげみみ　";
    const version = "GEN1" as GameVersion;
    const grid = { ...GRIDS[version], isHiragana: false };
    const { chars, modes } = decomposeTextWithMode(input, false, version);
    const sequences = findInputSequence(grid, chars.join(""), modes);
    const spaceSequence = sequences.find((seq) => seq.char === "　");

    expect(spaceSequence?.actions).toEqual(["A", "B", "←", "A"]);
  });

  test("GEN1: 文字数上限直前のスペースもED経由の最短ルートを使う", () => {
    const input = "くくく　";
    const version = "GEN1" as GameVersion;
    const grid = { ...GRIDS[version], isHiragana: false };
    const { chars, modes } = decomposeTextWithMode(input, false, version);
    const sequences = findInputSequence(grid, chars.join(""), modes);
    const spaceSequence = sequences.find((seq) => seq.char === "　");

    expect(spaceSequence?.actions).toEqual(["A", "A", "B", "B", "←", "A"]);
  });
});
