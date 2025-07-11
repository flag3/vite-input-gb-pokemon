import { InputAction, CharacterGrid, Position } from "../types";
import { MAX_CHAR_LIMITS } from "./constants";

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

  // Sアクションの場合は、GEN2で位置変更が必要
  if (action === "S") {
    if (grid.version !== "GEN1") {
      if (grid.version === "GEN2_MAIL") {
        pos.x = 15;
        pos.y = 4;
      } else {
        pos.x = 14;
        pos.y = 4;
      }
    }
    return pos;
  }

  // Aアクションの場合、MAX文字数に達した場合は確定ボタンへ移動
  if (action === "A" && inputCharCount !== undefined) {
    const isAtCharLimit = inputCharCount === MAX_CHAR_LIMITS[grid.version];
    if (isAtCharLimit) {
      if (grid.version === "GEN1") {
        pos.x = 8;
        pos.y = 5;
      } else if (grid.version === "GEN2_MAIL") {
        pos.x = 15;
        pos.y = 4;
      } else {
        pos.x = 14;
        pos.y = 4;
      }
      return pos;
    }
    return pos; // MAX文字数でない場合は位置変更しない
  }

  if (grid.version === "GEN1") {
    return calculateGen1NextPosition(pos, action, grid);
  } else {
    return calculateGen2NextPosition(pos, action, grid);
  }
};

/**
 * GEN1のグリッドナビゲーションロジック
 */
const calculateGen1NextPosition = (pos: Position, action: InputAction, grid: CharacterGrid): Position => {
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
        const currentRow = grid.grid.filter((p) => p.y === pos.y);
        const positions = currentRow.map((p) => p.x).sort((a, b) => a - b);
        const currentIndex = positions.indexOf(pos.x);
        pos.x = currentIndex === 0 ? positions[positions.length - 1] : positions[currentIndex - 1];
      }
      break;
    case "→":
      if (pos.y === 6) {
        pos.x = 0;
      } else {
        const currentRow = grid.grid.filter((p) => p.y === pos.y);
        const positions = currentRow.map((p) => p.x).sort((a, b) => a - b);
        const currentIndex = positions.indexOf(pos.x);
        pos.x = currentIndex === positions.length - 1 ? positions[0] : positions[currentIndex + 1];
      }
      break;
  }
  return pos;
};

/**
 * GEN2のグリッドナビゲーションロジック
 */
const calculateGen2NextPosition = (pos: Position, action: InputAction, grid: CharacterGrid): Position => {
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
        const currentRow = grid.grid.filter((p) => p.y === pos.y);
        const positions = currentRow.map((p) => p.x).sort((a, b) => a - b);
        const currentIndex = positions.indexOf(pos.x);
        pos.x = currentIndex === 0 ? positions[positions.length - 1] : positions[currentIndex - 1];
      }
      break;
    case "→":
      if (pos.y === 4) {
        handleGen2BottomRowNavigation(pos, "right", grid.version);
      } else {
        const currentRow = grid.grid.filter((p) => p.y === pos.y);
        const positions = currentRow.map((p) => p.x).sort((a, b) => a - b);
        const currentIndex = positions.indexOf(pos.x);
        pos.x = currentIndex === positions.length - 1 ? positions[0] : positions[currentIndex + 1];
      }
      break;
  }
  return pos;
};

/**
 * GEN2の下部行のナビゲーション処理
 */
export const handleGen2BottomRowNavigation = (pos: Position, direction: "left" | "right", version: string): void => {
  if (version === "GEN2_MAIL") {
    if (direction === "left") {
      if (pos.x >= 0 && pos.x <= 5) {
        pos.x = 12;
      } else if (pos.x >= 6 && pos.x <= 11) {
        pos.x = 0;
      } else if (pos.x >= 12 && pos.x <= 17) {
        pos.x = 6;
      }
    } else {
      // right
      if (pos.x >= 0 && pos.x <= 5) {
        pos.x = 6;
      } else if (pos.x >= 6 && pos.x <= 11) {
        pos.x = 12;
      } else if (pos.x >= 12 && pos.x <= 17) {
        pos.x = 0;
      }
    }
  } else {
    // GEN2_NICKNAME or GEN2_BOX
    if (direction === "left") {
      if (pos.x >= 0 && pos.x <= 4) {
        pos.x = 10;
      } else if (pos.x >= 5 && pos.x <= 9) {
        pos.x = 0;
      } else if (pos.x >= 10 && pos.x <= 14) {
        pos.x = 5;
      }
    } else {
      // right
      if (pos.x >= 0 && pos.x <= 4) {
        pos.x = 5;
      } else if (pos.x >= 5 && pos.x <= 9) {
        pos.x = 10;
      } else if (pos.x >= 10 && pos.x <= 14) {
        pos.x = 0;
      }
    }
  }
};

/**
 * "けってい"ボタンの位置を取得
 */
export const getConfirmButtonPosition = (version: string): Position => {
  if (version === "GEN1") {
    return { x: 8, y: 5 }; // GEN1の"ED"位置
  } else if (version === "GEN2_MAIL") {
    return { x: 15, y: 4 };
  } else {
    return { x: 14, y: 4 };
  }
};
