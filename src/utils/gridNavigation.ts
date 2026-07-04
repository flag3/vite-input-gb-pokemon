import { CONFIRM_POSITIONS, MAX_CHAR_LIMITS } from "../constants/gameConstants";
import type { InputAction, CharacterGrid, Position } from "../types";

/**
 * キー操作に応じた次の位置を計算します
 */
export const calculateNextPosition = (
  currentPosition: Position,
  action: InputAction,
  grid: CharacterGrid,
  inputCharCount?: number,
): Position => {
  const pos = { ...currentPosition };

  if (action === "s" || action === "B") {
    return pos; // これらのアクションは位置を変更しない
  }

  // Sアクションの場合は、GEN2で確定ボタンへ移動
  if (action === "S") {
    return grid.version === "GEN1" ? pos : { ...CONFIRM_POSITIONS[grid.version] };
  }

  // Aアクションの場合、MAX文字数に達した場合は確定ボタンへ移動
  if (action === "A") {
    return inputCharCount === MAX_CHAR_LIMITS[grid.version]
      ? { ...CONFIRM_POSITIONS[grid.version] }
      : pos;
  }

  if (grid.version === "GEN1") {
    return calculateGen1NextPosition(pos, action, grid);
  } else {
    return calculateGen2NextPosition(pos, action, grid);
  }
};

/**
 * 同じ行内で左右にラップしながら移動する
 */
const moveInRow = (pos: Position, grid: CharacterGrid, delta: -1 | 1): void => {
  const positions = grid.grid
    .filter((p) => p.y === pos.y)
    .map((p) => p.x)
    .sort((a, b) => a - b);
  const currentIndex = positions.indexOf(pos.x);
  const nextIndex = (currentIndex + delta + positions.length) % positions.length;
  pos.x = positions[nextIndex];
};

/**
 * GEN1のグリッドナビゲーションロジック
 */
const calculateGen1NextPosition = (
  pos: Position,
  action: InputAction,
  grid: CharacterGrid,
): Position => {
  switch (action) {
    case "↑":
      if (pos.y === 0) {
        pos.x = 0;
        pos.y = 6;
      } else {
        pos.y--;
      }
      break;
    case "↓":
      if (pos.y === 6) {
        pos.y = 0;
      } else if (pos.y === 5) {
        pos.x = 0;
        pos.y = 6;
      } else {
        pos.y++;
      }
      break;
    case "←":
      if (pos.y === 6) {
        pos.x = 0;
      } else {
        moveInRow(pos, grid, -1);
      }
      break;
    case "→":
      if (pos.y === 6) {
        pos.x = 0;
      } else {
        moveInRow(pos, grid, 1);
      }
      break;
  }
  return pos;
};

/**
 * GEN2のグリッドナビゲーションロジック
 */
const calculateGen2NextPosition = (
  pos: Position,
  action: InputAction,
  grid: CharacterGrid,
): Position => {
  switch (action) {
    case "↑":
      if (pos.y === 0) {
        pos.y = 4;
      } else {
        pos.y--;
      }
      break;
    case "↓":
      if (pos.y === 4) {
        pos.y = 0;
      } else {
        pos.y++;
      }
      break;
    case "←":
      if (pos.y === 4) {
        handleGen2BottomRowNavigation(pos, "left", grid.version);
      } else {
        moveInRow(pos, grid, -1);
      }
      break;
    case "→":
      if (pos.y === 4) {
        handleGen2BottomRowNavigation(pos, "right", grid.version);
      } else {
        moveInRow(pos, grid, 1);
      }
      break;
  }
  return pos;
};

/**
 * GEN2の下部行（かな/ていせい/けってい）のナビゲーション処理
 * 下部行は3つのボタンに分割されており、左右移動でボタン間をラップする
 */
const handleGen2BottomRowNavigation = (
  pos: Position,
  direction: "left" | "right",
  version: string,
): void => {
  const buttonWidth = version === "GEN2_MAIL" ? 6 : 5;
  const buttonCount = 3;
  const currentButton = Math.floor(pos.x / buttonWidth);
  const delta = direction === "left" ? -1 : 1;
  const nextButton = (currentButton + delta + buttonCount) % buttonCount;
  pos.x = nextButton * buttonWidth;
};
