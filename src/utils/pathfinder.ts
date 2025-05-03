import { CharacterGrid, InputAction, InputPath } from '../types';
import { MAX_CHAR_LIMITS } from './constants';
import { getFixedPositionForDakuten } from './gridPositions';
import { InternalPosition, findCharacterPosition, calculateDistance } from './pathfinderUtils';
import { findOptimalSpacePosition } from './spacePathfinder';

/**
 * 入力パスを検索
 * @param grid グリッド情報
 * @param text 入力するテキスト
 * @param modes 各文字のモード（true:ひらがな、false:カタカナ）
 * @returns 入力パス
 */
export const findInputSequence = (grid: CharacterGrid, text: string, modes: boolean[]): InputPath[] => {
  const sequences: InputPath[] = [];
  let currentPosition: InternalPosition = { x: 0, y: 0, char: '' };
  let currentIsHiragana = grid.isHiragana;
  let inputCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const currentChar = text[i];
    const targetMode = modes[i];
    const currentActions: InputAction[] = [];

    if (currentChar !== '゛' && currentChar !== '゜') {
      inputCharCount++;

      // スペースの処理
      if (currentChar === ' ') {
        let nextCharPosition: InternalPosition | null = null;
        if (i + 1 < text.length && text[i + 1] !== '゛' && text[i + 1] !== '゜') {
          const nextChar = text[i + 1];
          const nextMode = modes[i + 1];
          const nextHiraganaResult = findCharacterPosition(nextChar, { ...grid, isHiragana: true });
          const nextKatakanaResult = findCharacterPosition(nextChar, { ...grid, isHiragana: false });

          if (nextHiraganaResult || nextKatakanaResult) {
            const nextTargetIsHiragana = Boolean(nextHiraganaResult && (!nextKatakanaResult || nextMode));
            const nextTargetPosition = nextTargetIsHiragana
              ? nextHiraganaResult!.position
              : nextKatakanaResult!.position;

            nextCharPosition = nextTargetPosition;
          }
        }

        const { position: optimalSpacePosition, actions: optimalActions, totalSteps } =
          findOptimalSpacePosition(currentPosition, nextCharPosition, currentIsHiragana, grid);

        if (optimalActions.includes('s')) {
          currentIsHiragana = !currentIsHiragana;
        }

        sequences.push({
          char: currentChar,
          actions: optimalActions,
          totalSteps
        });

        currentPosition = optimalSpacePosition;
        continue;
      }

      // 通常文字の処理
      const hiraganaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: true });
      const katakanaResult = findCharacterPosition(currentChar, { ...grid, isHiragana: false });

      if (!hiraganaResult && !katakanaResult) continue;

      const targetIsHiragana = Boolean(hiraganaResult && (!katakanaResult || targetMode));
      const targetIsKatakana = Boolean(katakanaResult && (!hiraganaResult || !targetMode));

      // モード切替が必要かチェック
      if ((targetIsHiragana && !currentIsHiragana) || (targetIsKatakana && currentIsHiragana)) {
        currentActions.push('s');
        currentIsHiragana = !currentIsHiragana;
      }

      const targetPosition = targetIsHiragana ? hiraganaResult!.position : katakanaResult!.position;

      // 移動アクションを追加
      const { actions: moveActions } = calculateDistance(currentPosition, targetPosition, grid, inputCharCount);
      currentActions.push(...moveActions);
      currentActions.push('A');

      sequences.push({
        char: currentChar,
        actions: currentActions,
        totalSteps: currentActions.length
      });

      currentPosition = targetPosition;

      // 次の文字が濁点/半濁点の場合の処理
      if (i + 1 < text.length && (text[i + 1] === '゛' || text[i + 1] === '゜')) {
        const dakutenResult = findCharacterPosition(text[i + 1], grid);
        if (dakutenResult) {
          const dakutenActions: InputAction[] = [];
           
          // 文字数制限に達した場合の特別処理
          const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];
          if (isAtCharLimit) {
            const fixedStartPosition: InternalPosition = {
              ...getFixedPositionForDakuten(grid.version),
              char: currentPosition.char
            };

            const { actions: optimizedDakutenActions } = calculateDistance(fixedStartPosition, dakutenResult.position, grid, inputCharCount);
            dakutenActions.push(...optimizedDakutenActions);
          } else {
            const { actions: normalDakutenActions } = calculateDistance(currentPosition, dakutenResult.position, grid, inputCharCount);
            dakutenActions.push(...normalDakutenActions);
          }

          dakutenActions.push('A');

          sequences.push({
            char: text[i + 1],
            actions: dakutenActions,
            totalSteps: dakutenActions.length
          });

          currentPosition = dakutenResult.position;
          i++;
        }
      }
    }
  }

  // 最後の確定処理
  if (sequences.length > 0) {
    const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];
    
    if (grid.version === 'GEN1') {
      sequences.push({
        char: 'END',
        actions: [isAtCharLimit ? 'A' : 'S'],
        totalSteps: 1
      });
    } else if (!isAtCharLimit) {
      sequences.push({
        char: 'END',
        actions: ['S', 'A'],
        totalSteps: 2
      });
    } else {
      sequences.push({
        char: 'END',
        actions: ['A'],
        totalSteps: 1
      });
    }
  }

  return sequences;
}; 
