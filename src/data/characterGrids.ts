import { CharacterGrid, GameVersion } from '../types';

export const hiraganaGrid = [
  ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら'],
  ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'ゆ', 'リ'],
  ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'よ', 'る'],
  ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'わ', 'れ'],
  ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'ん', 'ろ'],
  ['ゃ', 'ゅ', 'ょ', 'っ', '゛', '゜', 'ー', '　', 'ED'],
  ['カナ']
];

export const katakanaGrid = [
  ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ'],
  ['イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', 'ユ', 'リ'],
  ['ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ヨ', 'ル'],
  ['エ', 'ケ', 'セ', 'テ', 'ネ', 'へ', 'メ', 'ワ', 'レ'],
  ['オ', 'コ', 'ソ', 'ト', 'ノ', 'ホ', 'モ', 'ン', 'ロ'],
  ['ャ', 'ュ', 'ョ', 'ッ', '゛', '゜', 'ー', '　', 'ED'],
  ['かな']
];

export const twoGenBoxHiraganaGrid = [
  ['あ', 'い', 'う', 'え', 'お', 'な', 'に', 'ぬ', 'ね', 'の', 'や', 'ゆ', 'よ', '　', '゛'],
  ['か', 'き', 'く', 'け', 'こ', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'わ', 'を', 'ん', '　', '゜'],
  ['さ', 'し', 'す', 'せ', 'そ', 'ま', 'み', 'む', 'め', 'も', 'ゃ', 'ゅ', 'ょ', 'っ', 'ー'],
  ['た', 'ち', 'つ', 'て', 'と', 'ら', 'リ', 'る', 'れ', 'ろ', '？', '！', '　', '　', '　'],
  ['カナ', 'カナ', 'カナ', 'カナ', 'カナ', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい']
];

export const twoGenBoxKatakanaGrid = [
  ['ア', 'イ', 'ウ', 'エ', 'オ', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ヤ', 'ユ', 'ヨ', '　', '゛'],
  ['カ', 'キ', 'ク', 'ケ', 'コ', 'ハ', 'ヒ', 'フ', 'へ', 'ホ', 'ワ', 'ヲ', 'ン', '　', '゜'],
  ['サ', 'シ', 'ス', 'セ', 'ソ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ャ', 'ュ', 'ョ', 'ッ', 'ー'],
  ['タ', 'チ', 'ツ', 'テ', 'ト', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ'],
  ['かな', 'かな', 'かな', 'かな', 'かな', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい']
];

export const twoGenMailHiraganaGrid = [
  ['あ', 'い', 'う', 'え', 'お', '　', 'か', 'き', 'く', 'け', 'こ', '　', 'さ', 'し', 'す', 'せ', 'そ', '゛'],
  ['た', 'ち', 'つ', 'て', 'と', '　', 'な', 'に', 'ぬ', 'ね', 'の', '　', 'は', 'ひ', 'ふ', 'へ', 'ほ', '゜'],
  ['ま', 'み', 'む', 'め', 'も', '　', 'ら', 'リ', 'る', 'れ', 'ろ', '　', 'や', 'ゆ', 'よ', 'わ', 'を', 'ん'],
  ['ゃ', 'ゅ', 'ょ', 'っ', 'ー', '　', '１', '２', '３', '４', '５', '　', '６', '７', '８', '９', '０', '　'],
  ['かな', 'かな', 'かな', 'かな', 'かな', 'かな', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい']
];

export const twoGenMailKatakanaGrid = [
  ['ア', 'イ', 'ウ', 'エ', 'オ', '　', 'カ', 'キ', 'ク', 'ケ', 'コ', '　', 'サ', 'シ', 'ス', 'セ', 'ソ', '゛'],
  ['タ', 'チ', 'ツ', 'テ', 'ト', '　', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', '　', 'ハ', 'ヒ', 'フ', 'へ', 'ホ', '゜'],
  ['マ', 'ミ', 'ム', 'メ', 'モ', '　', 'ラ', 'リ', 'ル', 'レ', 'ロ', '　', 'ヤ', 'ユ', 'ヨ', 'ワ', 'ヲ', 'ン'],
  ['ャ', 'ュ', 'ョ', 'ッ', 'ー', '　', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', '　', '／', '！', '？', '　', '　', '　'],
  ['かな', 'かな', 'かな', 'かな', 'かな', 'かな', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'ていせい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい', 'けってい']
];

export const createGrid = (version: GameVersion, isHiragana: boolean): CharacterGrid => {
  let baseGrid: string[][];
  let width: number;
  let height: number;

  switch (version) {
    case 'GEN1':
      baseGrid = isHiragana ? hiraganaGrid : katakanaGrid;
      width = 9;
      height = 7;
      break;
    case 'GEN2_NICKNAME':
      baseGrid = isHiragana ? twoGenBoxHiraganaGrid : twoGenBoxKatakanaGrid;
      width = 15;
      height = 5;
      break;
    case 'GEN2_BOX':
      baseGrid = isHiragana ? twoGenBoxHiraganaGrid : twoGenBoxKatakanaGrid;
      width = 15;
      height = 5;
      break;
    case 'GEN2_MAIL':
      baseGrid = isHiragana ? twoGenMailHiraganaGrid : twoGenMailKatakanaGrid;
      width = 18;
      height = 5;
      break;
  }

  return {
    version,
    isHiragana,
    width,
    height,
    grid: baseGrid.flatMap((row, y) =>
      row.map((char, x) => ({
        char,
        x,
        y
      }))
    ).filter(pos => {
      if (version === 'GEN1') {
        return !(pos.y === 6 && pos.x > 0);
      }
      return true;
    })
  };
};

export const GRIDS: Record<GameVersion, CharacterGrid> = {
  GEN1: createGrid('GEN1', true),
  GEN2_NICKNAME: createGrid('GEN2_NICKNAME', true),
  GEN2_BOX: createGrid('GEN2_BOX', true),
  GEN2_MAIL: createGrid('GEN2_MAIL', true)
}; 
