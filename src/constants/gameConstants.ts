import type { GameVersion, Position } from "../types";

// 各ゲームバージョンの文字数上限
export const MAX_CHAR_LIMITS: Record<GameVersion, number> = {
  GEN1: 5,
  GEN2_NICKNAME: 5,
  GEN2_BOX: 8,
  GEN2_MAIL: 32,
};

// 各ゲームバージョンの確定ボタン（ED / けってい）の位置
export const CONFIRM_POSITIONS: Record<GameVersion, Position> = {
  GEN1: { x: 8, y: 5 },
  GEN2_NICKNAME: { x: 14, y: 4 },
  GEN2_BOX: { x: 14, y: 4 },
  GEN2_MAIL: { x: 15, y: 4 },
};

// 特殊文字の判定
export const isControlChar = (char: string): boolean => {
  return (
    char === "ED" ||
    char === "カナ" ||
    char === "かな" ||
    char === "ていせい" ||
    char === "けってい"
  );
};

export const isDiacriticalMark = (char: string): boolean => {
  return char === "゛" || char === "゜" || char === "ー" || char === "リ" || char === "へ";
};

// グループ化可能な文字
export const GROUPABLE_CHARS = ["かな", "カナ", "ていせい", "けってい"];

// 濁点・半濁点の対応マップ
export const DAKUTEN_MAP: Record<string, [string, string]> = {
  が: ["か", "゛"],
  ぎ: ["き", "゛"],
  ぐ: ["く", "゛"],
  げ: ["け", "゛"],
  ご: ["こ", "゛"],
  ざ: ["さ", "゛"],
  じ: ["し", "゛"],
  ず: ["す", "゛"],
  ぜ: ["せ", "゛"],
  ぞ: ["そ", "゛"],
  だ: ["た", "゛"],
  ぢ: ["ち", "゛"],
  づ: ["つ", "゛"],
  で: ["て", "゛"],
  ど: ["と", "゛"],
  ば: ["は", "゛"],
  び: ["ひ", "゛"],
  ぶ: ["ふ", "゛"],
  べ: ["へ", "゛"],
  ぼ: ["ほ", "゛"],
  ぱ: ["は", "゜"],
  ぴ: ["ひ", "゜"],
  ぷ: ["ふ", "゜"],
  ぺ: ["へ", "゜"],
  ぽ: ["ほ", "゜"],
  ガ: ["カ", "゛"],
  ギ: ["キ", "゛"],
  グ: ["ク", "゛"],
  ゲ: ["ケ", "゛"],
  ゴ: ["コ", "゛"],
  ザ: ["サ", "゛"],
  ジ: ["シ", "゛"],
  ズ: ["ス", "゛"],
  ゼ: ["セ", "゛"],
  ゾ: ["ソ", "゛"],
  ダ: ["タ", "゛"],
  ヂ: ["チ", "゛"],
  ヅ: ["ツ", "゛"],
  デ: ["テ", "゛"],
  ド: ["ト", "゛"],
  バ: ["ハ", "゛"],
  ビ: ["ヒ", "゛"],
  ブ: ["フ", "゛"],
  ベ: ["ヘ", "゛"],
  ボ: ["ホ", "゛"],
  パ: ["ハ", "゜"],
  ピ: ["ヒ", "゜"],
  プ: ["フ", "゜"],
  ペ: ["ヘ", "゜"],
  ポ: ["ホ", "゜"],
};

// 濁点・半濁点の逆引きマップ（DAKUTEN_MAPから導出）
export const DAKUTEN_REVERSE_MAP: Record<string, Record<string, string>> = Object.entries(
  DAKUTEN_MAP,
).reduce<Record<string, Record<string, string>>>((map, [composed, [base, mark]]) => {
  map[base] = { ...map[base], [mark]: composed };
  return map;
}, {});
