import { BASE_GRIDS } from "../constants/characterGrids";
import {
  DAKUTEN_MAP,
  DAKUTEN_REVERSE_MAP,
  isDiacriticalMark,
  isControlChar,
  SPACE_CHARS,
} from "../constants/gameConstants";
import type { GameVersion, StateHistory } from "../types";

// 半角から全角への変換マップ
const HALFWIDTH_TO_FULLWIDTH_MAP: { [key: string]: string } = {
  "!": "！",
  "?": "？",
  "/": "／",
  "0": "０",
  "1": "１",
  "2": "２",
  "3": "３",
  "4": "４",
  "5": "５",
  "6": "６",
  "7": "７",
  "8": "８",
  "9": "９",
};

// スペース文字を正規化する関数
export const normalizeSpaces = (text: string): string => {
  let result = text;
  for (const char of SPACE_CHARS) {
    if (char !== "　") {
      result = result.replace(new RegExp(char, "g"), "　");
    }
  }
  return result;
};

// 半角文字を全角に変換する関数
export const normalizeHalfwidthChars = (text: string): string => {
  let result = "";
  for (const char of text) {
    result += HALFWIDTH_TO_FULLWIDTH_MAP[char] || char;
  }
  return result;
};

const excludeSpecialChars = (char: string): boolean => {
  return !isControlChar(char) && !isDiacriticalMark(char) && char !== "　";
};

// 各グリッドで使用可能な文字のセット（バージョン別）
const toCharSet = (grid: string[][]): Set<string> =>
  new Set(grid.flat().filter(excludeSpecialChars));

const KANA_SETS = Object.fromEntries(
  Object.entries(BASE_GRIDS).map(([version, grids]) => [
    version,
    { hiragana: toCharSet(grids.hiragana), katakana: toCharSet(grids.katakana) },
  ]),
) as Record<GameVersion, { hiragana: Set<string>; katakana: Set<string> }>;

export const decomposeTextWithMode = (
  text: string,
  initialIsHiragana: boolean,
  version: GameVersion,
): { chars: string[]; modes: boolean[] } => {
  const result: string[] = [];
  const modes: boolean[] = [];
  let currentIsHiragana = initialIsHiragana;

  // スペースを正規化し、半角文字を全角に変換
  const normalizedText = normalizeSpaces(normalizeHalfwidthChars(text));

  for (const char of normalizedText) {
    const decomposed = DAKUTEN_MAP[char];
    const chars = decomposed ? [decomposed[0], decomposed[1]] : [char];

    for (const c of chars) {
      if (c === "　" || c === "ED") {
        result.push(c);
        modes.push(currentIsHiragana);
        continue;
      }

      if (isDiacriticalMark(c)) {
        result.push(c);
        modes.push(modes[modes.length - 1] || currentIsHiragana);
        continue;
      }

      const charIsHiragana = KANA_SETS[version].hiragana.has(c);
      const charIsKatakana = KANA_SETS[version].katakana.has(c);

      if ((charIsHiragana && !currentIsHiragana) || (charIsKatakana && currentIsHiragana)) {
        currentIsHiragana = !currentIsHiragana;
      }

      result.push(c);
      modes.push(currentIsHiragana);
    }
  }

  return { chars: result, modes: modes };
};

/**
 * 再生履歴（Aで入力・Bで削除・濁点合成）から現在の表示テキストを復元する
 */
export const getDisplayText = (history: StateHistory[]): string => {
  let text = "";

  for (const state of history) {
    if (state.action === "B") {
      text = text.slice(0, -1);
    } else if (state.action === "A" && state.inputChar) {
      const lastChar = text[text.length - 1];
      if (state.inputChar === "゛" || state.inputChar === "゜") {
        const combined = lastChar ? DAKUTEN_REVERSE_MAP[lastChar]?.[state.inputChar] : undefined;
        if (combined) {
          text = text.slice(0, -1) + combined;
        }
      } else if (!isControlChar(state.inputChar)) {
        text += state.inputChar;
      }
    }
  }

  return text;
};
