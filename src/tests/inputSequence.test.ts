import { describe, test, expect, beforeAll } from 'vitest';
import { findInputSequence } from '../utils/pathfinder';
import { decomposeTextWithMode } from '../utils/characterMapping';
import { GRIDS } from '../data/characterGrids';
import { setupMatchers, InputTestCase } from './matchers';
import { InputAction } from '../types';

function formatActions(actions: InputAction[]): string {
  return actions.join('');
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
      input: 'ツツツツロ',
      version: 'GEN1',
      expectedActions: [
        '↓', '↓', '→', '→', '→', 'A',
        'A',
        'A',
        'A',
        'A', 'B', '↑', 'A',
        'A'
      ]
    },
    {
      input: 'ツツツロロ',
      version: 'GEN1',
      expectedActions: [
        '↓', '↓', '→', '→', '→', 'A',
        'A',
        'A',
        'A', 'A', 'B', 'B', '↑', 'A',
        'A',
        'A'
      ]
    },
    {
      input: 'ツツツヅロ',
      version: 'GEN1',
      expectedActions: [
        '↓', '↓', '→', '→', '→', 'A',
        'A',
        'A',
        'A',
        '↓', '↓', '↓', '→', 'A',
        '↓', '↑', '↑', '←', 'A',
        'A'
      ]
    },
    {
      input: 'キキキギノ',
      version: 'GEN1',
      expectedActions: [
        '↓', '→', 'A',
        'A',
        'A',
        'A',
        'A', 'B', '←', '←', '←', '←', 'A',
        '↑', 'A',
        'A'
      ]
    },
    {
      input: 'あいうぎろ',
      version: 'GEN1',
      expectedActions: [
        's', 'A',
        '↓', 'A',
        '↓', 'A',
        '↑', '→', 'A',
        'A', 'B', '←', '←', '←', '←', 'A',
        '↓', '↑', '↑', '←', 'A',
        'A'
      ]
    },
    {
      input: 'ああああが',
      version: 'GEN1',
      expectedActions: [
        's', 'A',
        'A',
        'A',
        'A',
        '→', 'A',
        '←', '←', '←', '←', 'A',
        'A'
      ]
    },
    {
      input: 'ヅずゆデの',
      version: 'GEN1',
      expectedActions: [
        '↓', '↓', '→', '→', '→', 'A',
        '↓', '↓', '↓', '→', 'A',
        's', '↑', '↑', '↑', '←', '←', 'A',
        '↓', '↓', '↓', '→', '→', 'A',
        '↓', '↓', '↓', '←', '←', 'A',
        's', '↓', '↓', '←', '←', '←', '←', 'A',
        '↓', '↓', '→', 'A',
        's', '↑', 'A',
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
    {
      input: 'コ　サ',
      version: 'GEN2_MAIL',
      expectedActions: [
        '↑', '←', '↓', '←', '←', 'A',
        '→', 'A',
        '→', 'A',
        'S', 'A'
      ]
    },
    {
      input: '９　９',
      version: 'GEN2_MAIL',
      expectedActions: [
        's', 'S', '↑', 'A',
        's', 'A',
        's', 'A',
        'S', 'A'
      ]
    },
    {
      input: '123',
      version: 'GEN2_MAIL',
      expectedActions: [
        's', '↑', '→', '↑', 'A',
        '→', 'A',
        '→', 'A',
        'S', 'A'
      ]
    },
    {
      input: '0123456789',
      version: 'GEN2_MAIL',
      expectedActions: [
        's', 'S', '↑', '→', 'A',
        '↓', '←', '↑', 'A',
        '→', 'A',
        '→', 'A',
        '→', 'A',
        '→', 'A',
        '→', '→', 'A',
        '→', 'A',
        '→', 'A',
        '→', 'A',
        'S', 'A'
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
        console.warn(`  期待: ${formatActions(expectedActions)}`);
        console.warn(`  実際: ${formatActions(actualActions)}`);
        expect(actualTotalSteps).toBe(expectedSteps);
      } else if (JSON.stringify(actualActions) !== JSON.stringify(expectedActions)) {
        console.warn(`⚠️ 警告: 総ステップ数は一致しますが、キー入力が異なります。`);
        console.warn(`  期待: ${formatActions(expectedActions)}`);
        console.warn(`  実際: ${formatActions(actualActions)}`);

        expect(actualActions).toHaveSameStepsButDifferentActions(expectedActions);
      } else {
        expect(actualActions).toEqual(expectedActions);
      }
    });
  });
}); 
