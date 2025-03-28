import { CharacterGrid, GameVersion } from '../types';

export const hiraganaGrid = [
  ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら'],
  ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'ゆ', 'り'],
  ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'よ', 'る'],
  ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'わ', 'れ'],
  ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'ん', 'ろ'],
  ['ゃ', 'ゅ', 'ょ', 'っ', '゛', '゜', 'ー', ' ', 'ED'],
  ['カナ']
];

export const katakanaGrid = [
  ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ'],
  ['イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', 'ユ', 'リ'],
  ['ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ヨ', 'ル'],
  ['エ', 'ケ', 'セ', 'テ', 'ネ', 'ヘ', 'メ', 'ワ', 'レ'],
  ['オ', 'コ', 'ソ', 'ト', 'ノ', 'ホ', 'モ', 'ン', 'ロ'],
  ['ャ', 'ュ', 'ョ', 'ッ', '゛', '゜', 'ー', ' ', 'ED'],
  ['かな']
];

export const createGrid = (version: GameVersion, isHiragana: boolean): CharacterGrid => {
  const baseGrid = isHiragana ? hiraganaGrid : katakanaGrid;

  return {
    version,
    isHiragana,
    width: 9,
    height: 7,
    grid: baseGrid.flatMap((row, y) =>
      row.map((char, x) => ({
        char,
        x,
        y
      }))
    ).filter(pos => !(pos.y === 6 && pos.x > 0))
  };
};

export const GRIDS: Record<GameVersion, CharacterGrid> = {
  GEN1: createGrid('GEN1', true),
  GEN2_MAIL: createGrid('GEN2_MAIL', true),
  GEN2_BOX: createGrid('GEN2_BOX', true)
}; 
