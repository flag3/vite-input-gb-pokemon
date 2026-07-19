import { BASE_GRIDS } from "../characterGrids";
import { expect, test } from "vitest";

// 旧実装のグリッドを row.join("") した既知の正解値
const EXPECTED = {
  GEN2_BOX: {
    hiragana: [
      "あいうえおなにぬねのやゆよ　゛",
      "かきくけこはひふへほわをん　゜",
      "さしすせそまみむめもゃゅょっー",
      "たちつてとらリるれろ？！　　　",
      "カナカナカナカナカナていせいていせいていせいていせいていせいけっていけっていけっていけっていけってい",
    ],
    katakana: [
      "アイウエオナニヌネノヤユヨ　゛",
      "カキクケコハヒフへホワヲン　゜",
      "サシスセソマミムメモャュョッー",
      "タチツテトラリルレロァィゥェォ",
      "かなかなかなかなかなていせいていせいていせいていせいていせいけっていけっていけっていけっていけってい",
    ],
  },
  GEN2_MAIL: {
    hiragana: [
      "あいうえお　かきくけこ　さしすせそ゛",
      "たちつてと　なにぬねの　はひふへほ゜",
      "まみむめも　らリるれろ　やゆよわをん",
      "ゃゅょっー　１２３４５　６７８９０　",
      "かなかなかなかなかなかなていせいていせいていせいていせいていせいていせいけっていけっていけっていけっていけっていけってい",
    ],
    katakana: [
      "アイウエオ　カキクケコ　サシスセソ゛",
      "タチツテト　ナニヌネノ　ハヒフへホ゜",
      "マミムメモ　ラリルレロ　ヤユヨワヲン",
      "ャュョッー　ァィゥェォ　／！？　　　",
      "かなかなかなかなかなかなていせいていせいていせいていせいていせいていせいけっていけっていけっていけっていけっていけってい",
    ],
  },
} as const;

test("GEN2 grids match legacy layout", () => {
  for (const [version, expected] of Object.entries(EXPECTED)) {
    const grids = BASE_GRIDS[version as keyof typeof BASE_GRIDS];
    expect(grids.hiragana.map((r) => r.join(""))).toEqual([...expected.hiragana]);
    expect(grids.katakana.map((r) => r.join(""))).toEqual([...expected.katakana]);
    // 下段は各ボタン幅ぶんセルが並ぶ（BOX:5 / MAIL:6）
    const width = version === "GEN2_MAIL" ? 18 : 15;
    for (const grid of [grids.hiragana, grids.katakana]) {
      expect(grid.every((row) => row.length === width)).toBe(true);
    }
  }
  expect(BASE_GRIDS.GEN2_NICKNAME.hiragana).toBe(BASE_GRIDS.GEN2_BOX.hiragana);
});
