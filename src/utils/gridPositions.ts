import { createGrid } from "../constants/characterGrids";
import type { CharacterPosition, GameVersion } from "../types";

/**
 * ひらがな/カタカナの対応マップ
 */
export const HIRAGANA_KATAKANA_MAP: Record<string, string[]> = {
  り: ["リ"],
  リ: ["り"],
  へ: ["ヘ"],
  ヘ: ["へ"],
};

/**
 * 各ゲームバージョンのスペース位置を取得する
 */
export const getSpacePositions = (
  version: GameVersion,
): {
  hiraganaSpaces: CharacterPosition[];
  katakanaSpaces: CharacterPosition[];
} => {
  const spacesIn = (isHiragana: boolean): CharacterPosition[] =>
    createGrid(version, isHiragana).grid.filter((pos) => pos.char === "　");

  return { hiraganaSpaces: spacesIn(true), katakanaSpaces: spacesIn(false) };
};
