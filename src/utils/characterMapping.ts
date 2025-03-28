import { hiraganaGrid, katakanaGrid, twoGenBoxHiraganaGrid, twoGenBoxKatakanaGrid, twoGenMailHiraganaGrid, twoGenMailKatakanaGrid } from '../data/characterGrids';
import { GameVersion } from '../types';

const dakutenMap: Record<string, [string, string]> = {
  'が': ['か', '゛'], 'ぎ': ['き', '゛'], 'ぐ': ['く', '゛'], 'げ': ['け', '゛'], 'ご': ['こ', '゛'],
  'ざ': ['さ', '゛'], 'じ': ['し', '゛'], 'ず': ['す', '゛'], 'ぜ': ['せ', '゛'], 'ぞ': ['そ', '゛'],
  'だ': ['た', '゛'], 'ぢ': ['ち', '゛'], 'づ': ['つ', '゛'], 'で': ['て', '゛'], 'ど': ['と', '゛'],
  'ば': ['は', '゛'], 'び': ['ひ', '゛'], 'ぶ': ['ふ', '゛'], 'べ': ['へ', '゛'], 'ぼ': ['ほ', '゛'],
  'ぱ': ['は', '゜'], 'ぴ': ['ひ', '゜'], 'ぷ': ['ふ', '゜'], 'ぺ': ['へ', '゜'], 'ぽ': ['ほ', '゜'],
  'ガ': ['カ', '゛'], 'ギ': ['キ', '゛'], 'グ': ['ク', '゛'], 'ゲ': ['ケ', '゛'], 'ゴ': ['コ', '゛'],
  'ザ': ['サ', '゛'], 'ジ': ['シ', '゛'], 'ズ': ['ス', '゛'], 'ゼ': ['セ', '゛'], 'ゾ': ['ソ', '゛'],
  'ダ': ['タ', '゛'], 'ヂ': ['チ', '゛'], 'ヅ': ['ツ', '゛'], 'デ': ['テ', '゛'], 'ド': ['ト', '゛'],
  'バ': ['ハ', '゛'], 'ビ': ['ヒ', '゛'], 'ブ': ['フ', '゛'], 'ベ': ['ヘ', '゛'], 'ボ': ['ホ', '゛'],
  'パ': ['ハ', '゜'], 'ピ': ['ヒ', '゜'], 'プ': ['フ', '゜'], 'ペ': ['ヘ', '゜'], 'ポ': ['ホ', '゜']
};

const isControlChar = (char: string): boolean => {
  return char === 'ED' || char === 'カナ' || char === 'かな' ||
    char === 'ていせい' || char === 'けってい';
};

const isDiacriticalMark = (char: string): boolean => {
  return char === '゛' || char === '゜' || char === 'ー';
};

const excludeSpecialChars = (char: string): boolean => {
  return !isControlChar(char) && !isDiacriticalMark(char) && char !== ' ' &&
    !char.match(/^[０-９]$/);
};


const gen1HiraganaChars = new Set(hiraganaGrid.flat().filter(excludeSpecialChars));
const gen1KatakanaChars = new Set(katakanaGrid.flat().filter(excludeSpecialChars));

const gen2BoxHiraganaChars = new Set(twoGenBoxHiraganaGrid.flat().filter(char =>
  !isControlChar(char) && !isDiacriticalMark(char) && char !== ' '
));


const gen2BoxKatakanaChars = new Set(twoGenBoxKatakanaGrid.flat().filter(char =>
  !isControlChar(char) && !isDiacriticalMark(char) && char !== ' '
));

const gen2MailHiraganaChars = new Set(twoGenMailHiraganaGrid.flat().filter(excludeSpecialChars));
const gen2MailKatakanaChars = new Set(twoGenMailKatakanaGrid.flat().filter(excludeSpecialChars));

const isHiragana = (char: string, version: GameVersion): boolean => {
  if (isDiacriticalMark(char)) return false;

  switch (version) {
    case 'GEN1':
      return gen1HiraganaChars.has(char);
    case 'GEN2_BOX':
      return gen2BoxHiraganaChars.has(char);
    case 'GEN2_MAIL':
      return gen2MailHiraganaChars.has(char);
    default:
      return false;
  }
};

const isKatakana = (char: string, version: GameVersion): boolean => {
  if (isDiacriticalMark(char)) return false;

  switch (version) {
    case 'GEN1':
      return gen1KatakanaChars.has(char);
    case 'GEN2_BOX':
      return gen2BoxKatakanaChars.has(char);
    case 'GEN2_MAIL':
      return gen2MailKatakanaChars.has(char);
    default:
      return false;
  }
};

export const decomposeTextWithMode = (text: string, initialIsHiragana: boolean, version: GameVersion): { chars: string[], modes: boolean[] } => {
  const result: string[] = [];
  const modes: boolean[] = [];
  let currentIsHiragana = initialIsHiragana;

  for (const char of text) {
    const decomposed = dakutenMap[char];
    const chars = decomposed ? [decomposed[0], decomposed[1]] : [char];

    for (const c of chars) {
      if (c === ' ' || c === 'ED') {
        result.push(c);
        modes.push(currentIsHiragana);
        continue;
      }

      if (isDiacriticalMark(c)) {
        result.push(c);
        modes.push(modes[modes.length - 1] || currentIsHiragana);
        continue;
      }

      const charIsHiragana = isHiragana(c, version);
      const charIsKatakana = isKatakana(c, version);

      if ((charIsHiragana && !currentIsHiragana) || (charIsKatakana && currentIsHiragana)) {
        currentIsHiragana = !currentIsHiragana;
      }

      result.push(c);
      modes.push(currentIsHiragana);
    }
  }

  return { chars: result, modes: modes };
}; 
