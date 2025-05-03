import { CharacterPosition, Position, GameVersion } from '../types';

/**
 * ひらがな/カタカナの対応マップ
 */
export const HIRAGANA_KATAKANA_MAP: Record<string, string[]> = {
  'り': ['リ'],
  'リ': ['り'],
  'へ': ['ヘ'],
  'ヘ': ['へ']
};

/**
 * 各ゲームバージョンのスペース位置を取得する
 */
export const getSpacePositions = (version: GameVersion): { hiraganaSpaces: CharacterPosition[], katakanaSpaces: CharacterPosition[] } => {
  const hiraganaSpaces: CharacterPosition[] = [];
  const katakanaSpaces: CharacterPosition[] = [];
  
  if (version === 'GEN1') {
    hiraganaSpaces.push(
      { char: ' ', x: 7, y: 5 }
    );
    katakanaSpaces.push(
      { char: ' ', x: 7, y: 5 }
    );
  } else if (version === 'GEN2_NICKNAME' || version === 'GEN2_BOX') {
    hiraganaSpaces.push(
      { char: ' ', x: 12, y: 3 },
      { char: ' ', x: 13, y: 0 },
      { char: ' ', x: 13, y: 1 },
      { char: ' ', x: 13, y: 3 },
      { char: ' ', x: 14, y: 3 }
    );
    katakanaSpaces.push(
      { char: ' ', x: 13, y: 0 },
      { char: ' ', x: 13, y: 1 }
    );
  } else if (version === 'GEN2_MAIL') {
    hiraganaSpaces.push(
      { char: ' ', x: 5, y: 0 },
      { char: ' ', x: 5, y: 1 },
      { char: ' ', x: 5, y: 2 },
      { char: ' ', x: 5, y: 3 },
      { char: ' ', x: 11, y: 0 },
      { char: ' ', x: 11, y: 1 },
      { char: ' ', x: 11, y: 2 },
      { char: ' ', x: 11, y: 3 },
      { char: ' ', x: 17, y: 3 }
    );
    katakanaSpaces.push(
      { char: ' ', x: 5, y: 0 },
      { char: ' ', x: 5, y: 1 },
      { char: ' ', x: 5, y: 2 },
      { char: ' ', x: 5, y: 3 },
      { char: ' ', x: 11, y: 0 },
      { char: ' ', x: 11, y: 1 },
      { char: ' ', x: 11, y: 2 },
      { char: ' ', x: 11, y: 3 },
      { char: ' ', x: 15, y: 3 },
      { char: ' ', x: 16, y: 3 },
      { char: ' ', x: 17, y: 3 }
    );
  }

  return { hiraganaSpaces, katakanaSpaces };
};

/**
 * 文字数上限に達した時の確定ボタンの位置を取得
 */
export const getFixedPositionForDakuten = (version: GameVersion): Position => {
  switch (version) {
    case 'GEN1':
      return { x: 8, y: 5 };
    case 'GEN2_NICKNAME':
    case 'GEN2_BOX':
      return { x: 14, y: 4 };
    case 'GEN2_MAIL':
      return { x: 15, y: 4 };
    default:
      return { x: 0, y: 0 };
  }
}; 