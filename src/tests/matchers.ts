import { GameVersion, InputAction } from "../types";
import { expect } from "vitest";

interface CustomMatchers<R = unknown> {
  toHaveSameStepsButDifferentActions(expectedActions: InputAction[]): R;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module "vitest" {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export function setupMatchers() {
  expect.extend({
    toHaveSameStepsButDifferentActions(actualActions: InputAction[], expectedActions: InputAction[]) {
      // 配列の長さが同じかどうかをチェック（ステップ数が同じ）
      const hasSameLength = actualActions.length === expectedActions.length;

      // 配列の内容が異なるかどうかをチェック
      let hasDifferentContent = false;
      for (let i = 0; i < actualActions.length; i++) {
        if (actualActions[i] !== expectedActions[i]) {
          hasDifferentContent = true;
          break;
        }
      }

      const pass = hasSameLength && hasDifferentContent;

      return {
        pass,
        message: () =>
          pass
            ? `期待: 異なるキー入力だが同じステップ数\n実際: ${actualActions.join(" → ")}`
            : `期待: 異なるキー入力だが同じステップ数\n実際: 総ステップ数またはキー入力が期待と一致しています。`,
      };
    },
  });
}

/**
 * 入力テストケースのインターフェース
 */
export interface InputTestCase {
  input: string;
  version: GameVersion;
  expectedActions: InputAction[];
  expectedTotalSteps?: number;
}
