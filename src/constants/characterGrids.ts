import type { CharacterGrid, GameVersion } from "../types";

const hiraganaGrid = [
  ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら"],
  ["い", "き", "し", "ち", "に", "ひ", "み", "ゆ", "リ"],
  ["う", "く", "す", "つ", "ぬ", "ふ", "む", "よ", "る"],
  ["え", "け", "せ", "て", "ね", "へ", "め", "わ", "れ"],
  ["お", "こ", "そ", "と", "の", "ほ", "も", "ん", "ろ"],
  ["ゃ", "ゅ", "ょ", "っ", "゛", "゜", "ー", "　", "ED"],
  ["カナ"],
];

const katakanaGrid = [
  ["ア", "カ", "サ", "タ", "ナ", "ハ", "マ", "ヤ", "ラ"],
  ["イ", "キ", "シ", "チ", "ニ", "ヒ", "ミ", "ユ", "リ"],
  ["ウ", "ク", "ス", "ツ", "ヌ", "フ", "ム", "ヨ", "ル"],
  ["エ", "ケ", "セ", "テ", "ネ", "へ", "メ", "ワ", "レ"],
  ["オ", "コ", "ソ", "ト", "ノ", "ホ", "モ", "ン", "ロ"],
  ["ャ", "ュ", "ョ", "ッ", "゛", "゜", "ー", "　", "ED"],
  ["かな"],
];

// グリッドの1行を1文字ずつのセルに分解する（全てBMP内のかな/記号なのでコードポイント分割で安全）
const chars = (row: string): string[] => Array.from(row);

// GEN2下段はカナ切替/ていせい/けっていの3ボタンが各buttonWidthセルを占める
const bottomRow = (kanaLabel: string, buttonWidth: number): string[] =>
  [kanaLabel, "ていせい", "けってい"].flatMap((label) => Array<string>(buttonWidth).fill(label));

const twoGenBoxHiraganaGrid = [
  chars("あいうえおなにぬねのやゆよ　゛"),
  chars("かきくけこはひふへほわをん　゜"),
  chars("さしすせそまみむめもゃゅょっー"),
  chars("たちつてとらリるれろ？！　　　"),
  bottomRow("カナ", 5),
];

const twoGenBoxKatakanaGrid = [
  chars("アイウエオナニヌネノヤユヨ　゛"),
  chars("カキクケコハヒフへホワヲン　゜"),
  chars("サシスセソマミムメモャュョッー"),
  chars("タチツテトラリルレロァィゥェォ"),
  bottomRow("かな", 5),
];

const twoGenMailHiraganaGrid = [
  chars("あいうえお　かきくけこ　さしすせそ゛"),
  chars("たちつてと　なにぬねの　はひふへほ゜"),
  chars("まみむめも　らリるれろ　やゆよわをん"),
  chars("ゃゅょっー　１２３４５　６７８９０　"),
  bottomRow("かな", 6),
];

const twoGenMailKatakanaGrid = [
  chars("アイウエオ　カキクケコ　サシスセソ゛"),
  chars("タチツテト　ナニヌネノ　ハヒフへホ゜"),
  chars("マミムメモ　ラリルレロ　ヤユヨワヲン"),
  chars("ャュョッー　ァィゥェォ　／！？　　　"),
  bottomRow("かな", 6),
];

// バージョンごとのひらがな/カタカナのベースグリッド
export const BASE_GRIDS: Record<GameVersion, { hiragana: string[][]; katakana: string[][] }> = {
  GEN1: { hiragana: hiraganaGrid, katakana: katakanaGrid },
  GEN2_NICKNAME: { hiragana: twoGenBoxHiraganaGrid, katakana: twoGenBoxKatakanaGrid },
  GEN2_BOX: { hiragana: twoGenBoxHiraganaGrid, katakana: twoGenBoxKatakanaGrid },
  GEN2_MAIL: { hiragana: twoGenMailHiraganaGrid, katakana: twoGenMailKatakanaGrid },
};

export const createGrid = (version: GameVersion, isHiragana: boolean): CharacterGrid => {
  const base = BASE_GRIDS[version];
  const baseGrid = isHiragana ? base.hiragana : base.katakana;

  return {
    version,
    isHiragana,
    width: baseGrid[0].length,
    height: baseGrid.length,
    grid: baseGrid
      .flatMap((row, y) =>
        row.map((char, x) => ({
          char,
          x,
          y,
        })),
      )
      .filter((pos) => {
        if (version === "GEN1") {
          return !(pos.y === 6 && pos.x > 0);
        }
        return true;
      }),
  };
};
