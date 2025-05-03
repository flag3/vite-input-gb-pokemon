import { describe, test, expect, beforeAll } from 'vitest';
import { findInputSequence } from '../utils/pathfinder';
import { decomposeTextWithMode } from '../utils/characterMapping';
import { GRIDS } from '../data/characterGrids';
import { setupMatchers, InputTestCase } from './matchers';
import { InputAction } from '../types';

function formatActions(actions: InputAction[]): string {
  return actions.join(' → ');
}

beforeAll(() => {
  setupMatchers();
});

describe('入力シーケンステスト', () => {
  const testCases: InputTestCase[] = [
    {
      input: 'ピカチュウ',
      version: 'GEN1',
      expectedActions: [
        '↓', '←', '←', '←', '←', 'A',
        '↓', '↓', '↓', '↓', 'A',
        '↓', '↓', '→', 'A',
        '↓', '→', '→', 'A',
        '↑', '↑', '↑', '→', 'A',
        '↑', '↑', '↑', '←', 'A',
        'A'
      ]
    },
    {
      input: 'ミュウ',
      version: 'GEN2_NICKNAME',
      expectedActions: [
        '↑', '→', '↑', '↑', '→', 'A',
        '→', '→', '→', '→', '→', 'A',
        'S', '↓', '→', '→', '→', 'A',
        'S', 'A'
      ]
    },
    {
      input: 'ゅョゥマわてエろ',
      version: 'GEN2_BOX',
      expectedActions: [
        's', '↑', '←', '↑', '↑', '→', 'A',
        's', '→', 'A',
        '↓', 'A',
        '↓', '←', '↑', '↑', 'A',
        's', '↓', '↓', '→', '↓', '↓', 'A',
        'S', '←', '↑', '←', '←', 'A',
        's', '↓', '↓', 'A',
        's', '↑', '←', '↑', '←', 'A',
        'A'
      ]
    },
    {
      input: 'がわぜォひすよえ',
      version: 'GEN2_BOX',
      expectedActions: [
        's', '↓', 'A',
        '↑', '←', 'A',
        '↑', '←', '→', '↓', '↓', 'A',
        'S', '←', '↑', '↑', '←', '←', 'A',
        'S', '↓', 'A',
        's', '↑', '↑', 'A',
        's', '↓', '←', '↓', '↓', '→', 'A',
        '↓', '←', '←', '←', '←', 'A',
        'S', '↓', '←', '←', 'A',
        '↑', '←', '↓', '←', '←', 'A',
        'A'
      ]
    },
    {
      input: 'ヅそリひさデづヅ',
      version: 'GEN2_BOX',
      expectedActions: [
        '↑', '↑', '→', '→', 'A',
        'S', '↓', 'A',
        's', '↑', '←', '↑', '↑', '←', 'A',
        '↓', '→', '→', 'A',
        '↑', '↑', 'A',
        'S', '↑', '↑', '→', 'A',
        's', '↓', '→', '→', '→', 'A',
        'S', '↓', 'A',
        's', '↑', '↑', '→', '→', '→', 'A',
        'S', '↓', 'A',
        's', '↑', '↑', '→', '→', '→', 'A',
        '↓', 'A',
        'A'
      ]
    },
    {
      input: 'ろボにきデづゅの',
      version: 'GEN2_BOX',
      expectedActions: [
        's', '↑', '←', '↑', '←', 'A',
        's', '↑', '↑', 'A',
        'S', '↓', 'A',
        's', '↑', '←', '↓', '→', 'A',
        '↑', '←', '↓', '↓', '→', 'A',
        's', '↓', '↓', '→', '→', 'A',
        'S', '↓', 'A',
        's', '↑', '↑', '→', '→', '→', 'A',
        'S', '↓', 'A',
        '↓', '↓', '←', '←', '←', 'A',
        '↑', '↑', '←', '←', 'A',
        'A'
      ]
    },
  ];

  testCases.forEach((testCase, index) => {
    test(`テストケース #${index + 1}: "${testCase.input}" (${testCase.version})`, () => {
      const { input, version, expectedActions } = testCase;

      const grid = { ...GRIDS[version], isHiragana: false };
      const { chars, modes } = decomposeTextWithMode(input, false, version);

      const sequences = findInputSequence(grid, chars.join(''), modes);

      const actualActions = sequences.flatMap(seq => seq.actions);

      const actualTotalSteps = sequences.reduce((sum, seq) => sum + seq.totalSteps, 0);

      const expectedSteps = expectedActions.length;

      if (actualTotalSteps !== expectedSteps) {
        console.error(`❌ エラー: 総ステップ数が一致しません。期待: ${expectedSteps}, 実際: ${actualTotalSteps}`);
        expect(actualTotalSteps).toBe(expectedSteps);
      } else if (JSON.stringify(actualActions) !== JSON.stringify(expectedActions)) {
        console.warn(`⚠️ 警告: 総ステップ数は一致しますが、キー入力が異なります。`);
        console.warn(`  期待: ${formatActions(expectedActions)}`);
        console.warn(`  実際: ${formatActions(actualActions)}`);

        // @ts-expect-error カスタムマッチャーの型定義
        expect(actualActions).toHaveSameStepsButDifferentActions(expectedActions);
      } else {
        expect(actualActions).toEqual(expectedActions);
      }
    });
  });
}); 
