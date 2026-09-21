import { createGrid } from "../../constants/characterGrids";
import type { GameVersion } from "../../types";
import { findCharacterPosition } from "../pathfinderUtils";
import { expect, test } from "vitest";

test.each<GameVersion>(["GEN1", "GEN2_NICKNAME", "GEN2_BOX", "GEN2_MAIL"])(
  "%s: 検索位置とモードを返し、共通文字では指定モードを優先する",
  (version) => {
    for (const isHiragana of [false, true]) {
      const grid = createGrid(version, isHiragana);
      for (const [char, displayedChar] of [
        ["り", "リ"],
        ["リ", "リ"],
        ["へ", "へ"],
        ["ヘ", "へ"],
        ["ー", "ー"],
        ["゛", "゛"],
        ["゜", "゜"],
        ["　", "　"],
      ]) {
        expect(findCharacterPosition(char, grid)).toEqual({
          position: grid.grid.find((cell) => cell.char === displayedChar),
          isHiragana,
        });
      }

      for (const [char, targetMode] of [
        ["あ", true],
        ["ア", false],
      ] as const) {
        expect(findCharacterPosition(char, grid)).toEqual({
          position: createGrid(version, targetMode).grid.find((cell) => cell.char === char),
          isHiragana: targetMode,
        });
      }
      expect(findCharacterPosition("漢", grid)).toBeNull();
    }
  },
);
