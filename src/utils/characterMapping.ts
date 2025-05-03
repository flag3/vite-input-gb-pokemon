import { hiraganaGrid, katakanaGrid, twoGenBoxHiraganaGrid, twoGenBoxKatakanaGrid, twoGenMailHiraganaGrid, twoGenMailKatakanaGrid } from '../data/characterGrids';
import { GameVersion } from '../types';
import { DAKUTEN_MAP, isDiacriticalMark, isControlChar, SPACE_CHARS } from './constants';

// スペース文字を正規化する関数
export const normalizeSpaces = (text: string): string => {
  let result = text;
  for (const char of SPACE_CHARS) {
    if (char !== '　') {
      result = result.replace(new RegExp(char, 'g'), '　');
    }
  }
  return result;
};

const excludeSpecialChars = (char: string): boolean => {
  return !isControlChar(char) && !isDiacriticalMark(char) && char !== '　';
};

// 各グリッドで使用可能な文字のセットを作成
const gen1HiraganaChars = new Set(hiraganaGrid.flat().filter(excludeSpecialChars));
const gen1KatakanaChars = new Set(katakanaGrid.flat().filter(excludeSpecialChars));

const gen2BoxHiraganaChars = new Set(twoGenBoxHiraganaGrid.flat().filter(char =>
  !isControlChar(char) && !isDiacriticalMark(char) && char !== '　'
));


const gen2BoxKatakanaChars = new Set(twoGenBoxKatakanaGrid.flat().filter(char =>
  !isControlChar(char) && !isDiacriticalMark(char) && char !== '　'
));

const gen2MailHiraganaChars = new Set(twoGenMailHiraganaGrid.flat().filter(excludeSpecialChars));
const gen2MailKatakanaChars = new Set(twoGenMailKatakanaGrid.flat().filter(excludeSpecialChars));

const isHiragana = (char: string, version: GameVersion): boolean => {
  if (isDiacriticalMark(char)) return false;

  switch (version) {
    case 'GEN1':
      return gen1HiraganaChars.has(char);
    case 'GEN2_NICKNAME':
      return gen2BoxHiraganaChars.has(char);
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
    case 'GEN2_NICKNAME':
      return gen2BoxKatakanaChars.has(char);
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

  // スペースを正規化
  const normalizedText = normalizeSpaces(text);

  for (const char of normalizedText) {
    const decomposed = DAKUTEN_MAP[char];
    const chars = decomposed ? [decomposed[0], decomposed[1]] : [char];

    for (const c of chars) {
      if (c === '　' || c === 'ED') {
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
