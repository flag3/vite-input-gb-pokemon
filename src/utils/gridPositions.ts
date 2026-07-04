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
  // ひらがなとカタカナのグリッドを取得
  const hiraganaGrid = createGrid(version, true);
  const katakanaGrid = createGrid(version, false);

  // グリッドから空白の位置を抽出
  const hiraganaSpaces = hiraganaGrid.grid
    .filter((pos) => pos.char === "　")
    .map((pos) => ({ char: "　", x: pos.x, y: pos.y }));

  const katakanaSpaces = katakanaGrid.grid
    .filter((pos) => pos.char === "　")
    .map((pos) => ({ char: "　", x: pos.x, y: pos.y }));

  return { hiraganaSpaces, katakanaSpaces };
};
