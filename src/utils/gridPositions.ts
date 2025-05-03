import { CharacterPosition, Position, GameVersion } from '../types';
import { createGrid } from '../data/characterGrids';

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
  // ひらがなとカタカナのグリッドを取得
  const hiraganaGrid = createGrid(version, true);
  const katakanaGrid = createGrid(version, false);

  // グリッドから空白の位置を抽出
  const hiraganaSpaces = hiraganaGrid.grid.filter(pos => pos.char === '　')
    .map(pos => ({ char: '　', x: pos.x, y: pos.y }));

  const katakanaSpaces = katakanaGrid.grid.filter(pos => pos.char === '　')
    .map(pos => ({ char: '　', x: pos.x, y: pos.y }));

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
