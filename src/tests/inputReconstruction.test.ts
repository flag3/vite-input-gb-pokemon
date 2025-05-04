import { describe, test, expect, beforeAll } from 'vitest';
import { findInputSequence } from '../utils/pathfinder';
import { decomposeTextWithMode } from '../utils/characterMapping';
import { GRIDS } from '../data/characterGrids';
import { setupMatchers } from './matchers';
import { InputAction, GameVersion } from '../types';
import { DAKUTEN_REVERSE_MAP, MAX_CHAR_LIMITS } from '../utils/constants';

/**
 * アクションが各グリッドの文字位置に与える影響をシミュレートする関数
 * グリッド内での矢印キー移動を正確に再現する
 */

// 可視文字数をカウント（濁点付き文字は1文字としてカウント）
function countVisibleChars(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    // 濁点・半濁点は前の文字と組み合わせで1文字としてカウント
    if (i > 0 && (text[i] === '゛' || text[i] === '゜') &&
      DAKUTEN_REVERSE_MAP[text[i - 1]]?.[text[i]]) {
      continue;
    }
    count++;
  }
  return count;
}

function formatActions(actions: InputAction[]): string {
  return actions.join('');
}

// 入力シーケンスの期待値を定義するためのインターフェース
interface InputSequenceTestCase {
  input: string;
  version: GameVersion;
  expectedSequence: string[];  // 期待される文字のシーケンス
}

beforeAll(() => {
  setupMatchers();
});

describe('入力シーケンス検証テスト', () => {
  // 入力シーケンスのテストケース
  const testCases: InputSequenceTestCase[] = [
    {
      input: 'あいうえお',
      version: 'GEN1',
      expectedSequence: ['あ', 'い', 'う', 'え', 'お']
    },
    {
      input: 'ピカチュウ',
      version: 'GEN1',
      // 濁点付き文字「ピ」は「ヒ」+「゜」として処理される
      expectedSequence: ['ヒ', '゜', 'カ', 'チ', 'ュ', 'ウ']
    },
    {
      input: 'ツツツツロ',
      version: 'GEN1',
      expectedSequence: ['ツ', 'ツ', 'ツ', 'ツ', 'ロ']
    },
    {
      input: 'キキキギノ',
      version: 'GEN1',
      // 濁点付き文字「ギ」は「キ」+「゛」として処理される
      expectedSequence: ['キ', 'キ', 'キ', 'キ', '゛', 'ノ']
    },
    {
      input: 'ヅずゆデの',
      version: 'GEN1',
      // 濁点付き文字「ヅ」「デ」は「ツ」+「゛」、「テ」+「゛」として処理される
      // 「ず」も「す」+「゛」として処理される
      expectedSequence: ['ツ', '゛', 'す', '゛', 'ゆ', 'テ', '゛', 'の']
    },
    {
      input: 'がざだば',
      version: 'GEN1',
      // 濁点付き文字は基本文字+濁点で処理される
      expectedSequence: ['か', '゛', 'さ', '゛', 'た', '゛', 'は', '゛']
    },
    {
      input: 'コ　サ',
      version: 'GEN2_MAIL',
      expectedSequence: ['コ', '　', 'サ']
    }
  ];

  testCases.forEach((testCase, index) => {
    test(`入力シーケンス検証 #${index + 1}: "${testCase.input}" (${testCase.version})`, () => {
      const { input, version, expectedSequence } = testCase;

      // グリッド情報の取得
      const grid = { ...GRIDS[version], isHiragana: false };

      // テキストをキャラクターとモードに分解
      const { chars, modes } = decomposeTextWithMode(input, false, version);

      // キー入力シーケンスの取得
      const sequences = findInputSequence(grid, chars.join(''), modes);

      // すべてのアクションを結合
      const allActions = sequences.flatMap(seq => seq.actions);

      // 予測される文字シーケンス（END以外）を取得
      const actualSequence = sequences
        .map(seq => seq.char)
        .filter(char => char !== 'END');

      // デバッグ情報を出力
      console.log(`入力テキスト: ${input} (表示文字数: ${countVisibleChars(input)}, 最大文字数: ${MAX_CHAR_LIMITS[version]})`);
      console.log(`入力アクション: ${formatActions(allActions)}`);
      console.log(`文字シーケンス: ${actualSequence.join(', ')}`);

      // 実際の文字シーケンスが期待通りかをチェック
      expect(actualSequence).toEqual(expectedSequence);

      // 濁点付き文字の処理検証
      if (input.match(/[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ]/)) {
        // 濁点付き文字を含む場合、濁点/半濁点が出現するかチェック
        const hasDakuten = actualSequence.includes('゛') || actualSequence.includes('゜');
        expect(hasDakuten).toBe(true);
      }

      // 総文字数が制限内かチェック（ENDを除く）
      // 注：濁点はカウントしないため、実際の文字数はこれより少なくなる
      const effectiveChars = actualSequence.filter(char => char !== '゛' && char !== '゜');
      expect(effectiveChars.length).toBeLessThanOrEqual(MAX_CHAR_LIMITS[version]);

      // バージョンに応じた追加のアサーション
      switch (version) {
        case 'GEN1':
          // GEN1では決定キー(A)またはEND選択が最後に必要
          const lastAction = allActions[allActions.length - 1];
          expect(['A', 'S']).toContain(lastAction);
          break;
        case 'GEN2_NICKNAME':
        case 'GEN2_BOX':
        case 'GEN2_MAIL':
          // GEN2シリーズの場合のチェック
          break;
      }
    });
  });

  // 濁点・半濁点のテストケース（パターン別）
  const dakutenTestCases = [
    {
      name: 'カ行濁点',
      input: 'がぎぐげご',
      version: 'GEN1' as GameVersion,
      baseChars: ['か', 'き', 'く', 'け', 'こ']
    },
    {
      name: 'サ行濁点',
      input: 'ざじずぜぞ',
      version: 'GEN1' as GameVersion,
      baseChars: ['さ', 'し', 'す', 'せ', 'そ']
    },
    {
      name: 'タ行濁点',
      input: 'だぢづでど',
      version: 'GEN1' as GameVersion,
      baseChars: ['た', 'ち', 'つ', 'て', 'と']
    },
    {
      name: 'ハ行濁点',
      input: 'ばびぶべぼ',
      version: 'GEN1' as GameVersion,
      baseChars: ['は', 'ひ', 'ふ', 'へ', 'ほ']
    },
    {
      name: 'ハ行半濁点',
      input: 'ぱぴぷぺぽ',
      version: 'GEN1' as GameVersion,
      baseChars: ['は', 'ひ', 'ふ', 'へ', 'ほ']
    }
  ];

  dakutenTestCases.forEach(testCase => {
    test(`濁点・半濁点処理検証: ${testCase.name}`, () => {
      const { input, version, baseChars } = testCase;

      // グリッド情報の取得
      const grid = { ...GRIDS[version], isHiragana: false };

      // テキストをキャラクターとモードに分解
      const { chars, modes } = decomposeTextWithMode(input, false, version);

      // キー入力シーケンスの取得
      const sequences = findInputSequence(grid, chars.join(''), modes);

      // 予測される文字シーケンス（END以外）を取得
      const actualSequence = sequences
        .map(seq => seq.char)
        .filter(char => char !== 'END');

      // デバッグ情報を出力
      console.log(`入力テキスト: ${input}`);
      console.log(`文字シーケンス: ${actualSequence.join(', ')}`);

      // 各文字について、基本文字と濁点/半濁点が正しく含まれているか検証
      const expectedDakutenMark = input.includes('ぱ') || input.includes('パ') ? '゜' : '゛';
      let dakutenCount = 0;

      for (const baseChar of baseChars) {
        const charCount = actualSequence.filter(char => char === baseChar).length;
        expect(charCount).toBeGreaterThan(0);
        dakutenCount += charCount;
      }

      const markCount = actualSequence.filter(char => char === expectedDakutenMark).length;
      // 少なくとも1つの濁点/半濁点があるはず
      expect(markCount).toBeGreaterThan(0);
    });
  });
}); 
