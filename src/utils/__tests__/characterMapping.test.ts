import { GRIDS } from "../../constants/characterGrids";
import { DAKUTEN_REVERSE_MAP, MAX_CHAR_LIMITS } from "../../constants/gameConstants";
import type { GameVersion } from "../../types";
import { decomposeTextWithMode } from "../characterMapping";
import { findInputSequence } from "../pathfinder";
import { describe, test, expect } from "vitest";

// 可視文字数をカウント（濁点付き文字は1文字としてカウント）
function countVisibleChars(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    // 濁点・半濁点は前の文字と組み合わせで1文字としてカウント
    if (
      i > 0 &&
      (text[i] === "゛" || text[i] === "゜") &&
      DAKUTEN_REVERSE_MAP[text[i - 1]]?.[text[i]]
    ) {
      continue;
    }
    count++;
  }
  return count;
}

describe("characterMapping - 文字分解と濁点処理", () => {
  describe("基本的な文字分解", () => {
    const testCases = [
      {
        input: "あいうえお",
        version: "GEN1" as GameVersion,
        expectedSequence: ["あ", "い", "う", "え", "お"],
      },
      {
        input: "ピカチュウ",
        version: "GEN1" as GameVersion,
        // 濁点付き文字「ピ」は「ヒ」+「゜」として処理される
        expectedSequence: ["ヒ", "゜", "カ", "チ", "ュ", "ウ"],
      },
      {
        input: "ツツツツロ",
        version: "GEN1" as GameVersion,
        expectedSequence: ["ツ", "ツ", "ツ", "ツ", "ロ"],
      },
      {
        input: "キキキギノ",
        version: "GEN1" as GameVersion,
        // 濁点付き文字「ギ」は「キ」+「゛」として処理される
        expectedSequence: ["キ", "キ", "キ", "キ", "゛", "ノ"],
      },
      {
        input: "がざだば",
        version: "GEN1" as GameVersion,
        // 濁点付き文字は基本文字+濁点で処理される
        expectedSequence: ["か", "゛", "さ", "゛", "た", "゛", "は", "゛"],
      },
      {
        input: "コ　サ",
        version: "GEN2_MAIL" as GameVersion,
        expectedSequence: ["コ", "　", "サ"],
      },
    ];

    testCases.forEach((testCase, index) => {
      test(`文字分解 #${index + 1}: "${testCase.input}" (${testCase.version})`, () => {
        const { input, version, expectedSequence } = testCase;

        const grid = { ...GRIDS[version], isHiragana: false };
        const { chars, modes } = decomposeTextWithMode(input, false, version);
        const sequences = findInputSequence(grid, chars.join(""), modes);

        // 予測される文字シーケンス（END以外）を取得
        const actualSequence = sequences.map((seq) => seq.char).filter((char) => char !== "END");

        expect(actualSequence).toEqual(expectedSequence);

        // 濁点付き文字の処理検証
        if (
          input.match(
            /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ]/,
          )
        ) {
          const hasDakuten = actualSequence.includes("゛") || actualSequence.includes("゜");
          expect(hasDakuten).toBe(true);
        }

        // 総文字数が制限内かチェック
        const effectiveChars = actualSequence.filter((char) => char !== "゛" && char !== "゜");
        expect(effectiveChars.length).toBeLessThanOrEqual(MAX_CHAR_LIMITS[version]);
      });
    });
  });

  describe("濁点・半濁点のパターン別処理", () => {
    const dakutenTestCases = [
      {
        name: "カ行濁点",
        input: "がぎぐげご",
        version: "GEN1" as GameVersion,
        baseChars: ["か", "き", "く", "け", "こ"],
        dakutenMark: "゛",
      },
      {
        name: "サ行濁点",
        input: "ざじずぜぞ",
        version: "GEN1" as GameVersion,
        baseChars: ["さ", "し", "す", "せ", "そ"],
        dakutenMark: "゛",
      },
      {
        name: "タ行濁点",
        input: "だぢづでど",
        version: "GEN1" as GameVersion,
        baseChars: ["た", "ち", "つ", "て", "と"],
        dakutenMark: "゛",
      },
      {
        name: "ハ行濁点",
        input: "ばびぶべぼ",
        version: "GEN1" as GameVersion,
        baseChars: ["は", "ひ", "ふ", "へ", "ほ"],
        dakutenMark: "゛",
      },
      {
        name: "ハ行半濁点",
        input: "ぱぴぷぺぽ",
        version: "GEN1" as GameVersion,
        baseChars: ["は", "ひ", "ふ", "へ", "ほ"],
        dakutenMark: "゜",
      },
    ];

    dakutenTestCases.forEach((testCase) => {
      test(`${testCase.name}の処理`, () => {
        const { input, version, baseChars, dakutenMark } = testCase;

        const grid = { ...GRIDS[version], isHiragana: false };
        const { chars, modes } = decomposeTextWithMode(input, false, version);
        const sequences = findInputSequence(grid, chars.join(""), modes);

        // 予測される文字シーケンス（END以外）を取得
        const actualSequence = sequences.map((seq) => seq.char).filter((char) => char !== "END");

        // 各文字について、基本文字と濁点/半濁点が正しく含まれているか検証
        for (const baseChar of baseChars) {
          const charCount = actualSequence.filter((char) => char === baseChar).length;
          expect(charCount).toBeGreaterThan(0);
        }

        const markCount = actualSequence.filter((char) => char === dakutenMark).length;
        expect(markCount).toBeGreaterThan(0);
      });
    });
  });

  describe("文字数カウント", () => {
    test("可視文字数のカウントが正しい", () => {
      expect(countVisibleChars("あいうえお")).toBe(5);
      expect(countVisibleChars("がぎぐげご")).toBe(5); // 濁点付きでも5文字
      expect(countVisibleChars("ぱぴぷぺぽ")).toBe(5); // 半濁点付きでも5文字
      expect(countVisibleChars("ピカチュウ")).toBe(5); // カタカナでも5文字
    });
  });
});
