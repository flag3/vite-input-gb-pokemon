import { createGrid } from "../constants/characterGrids";
import {
  CONFIRM_POSITIONS,
  MAX_CHAR_LIMITS,
  isControlChar,
  isDakutenChar,
} from "../constants/gameConstants";
import type { GameVersion, StateHistory } from "../types";
import { getDisplayText } from "../utils/characterMapping";
import { calculateNextPosition } from "../utils/gridNavigation";
import { findInputSequence } from "../utils/pathfinder";
import { useState, useCallback, useEffect, useMemo } from "react";

const BASE_STEP_INTERVAL_MS = 500;

const initialHistory = (): StateHistory[] => [
  {
    position: { x: 0, y: 0 },
    isHiragana: false,
    charIndex: 0,
    action: null,
    inputChar: null,
  },
];

/**
 * 履歴から次の1ステップ分の状態を計算して追加した新しい履歴を返す純関数。
 * 履歴が唯一の状態源なので、レンダーを挟まず連続で呼ばれても壊れない。
 * 全ステップ消化済みの場合は履歴をそのまま返す。
 */
export const advanceHistory = (
  history: StateHistory[],
  sequences: ReturnType<typeof findInputSequence>,
  currentVersion: GameVersion,
): StateHistory[] => {
  const currentStep = history.length - 1;
  const lastState = history[history.length - 1];

  let stepCount = 0;
  let inputCharCount = 0;
  const newPosition = { ...lastState.position };
  let newIsHiragana = lastState.isHiragana;
  let currentInputChar: string | null = null;

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    if (!isDakutenChar(sequence.char)) {
      inputCharCount++;
    }
    if (stepCount + sequence.actions.length > currentStep) {
      const actionIndex = currentStep - stepCount;
      const action = sequence.actions[actionIndex];

      if (action === "s") {
        newIsHiragana = !newIsHiragana;
      } else if (action === "S" && currentVersion !== "GEN1") {
        newPosition.x = CONFIRM_POSITIONS[currentVersion].x;
        newPosition.y = CONFIRM_POSITIONS[currentVersion].y;
      } else if (action === "A") {
        const grid = createGrid(currentVersion, newIsHiragana);
        const charAtPosition = grid.grid.find(
          (item) => item.x === newPosition.x && item.y === newPosition.y,
        );

        if (charAtPosition) {
          currentInputChar = charAtPosition.char;
        }

        const tempHistory = [
          ...history,
          {
            position: { ...newPosition },
            isHiragana: newIsHiragana,
            charIndex: i,
            action,
            inputChar: currentInputChar,
          },
        ];

        const newTextLength = getDisplayText(tempHistory).length;

        if (
          newTextLength >= MAX_CHAR_LIMITS[currentVersion] &&
          currentInputChar &&
          !isControlChar(currentInputChar)
        ) {
          const confirmPos = CONFIRM_POSITIONS[currentVersion];
          newPosition.x = confirmPos.x;
          newPosition.y = confirmPos.y;
        }
      } else if (action === "B") {
        currentInputChar = "DELETE";
      } else if (action === "↑" || action === "↓" || action === "←" || action === "→") {
        const grid = createGrid(currentVersion, newIsHiragana);
        const nextPos = calculateNextPosition(newPosition, action, grid, inputCharCount);
        newPosition.x = nextPos.x;
        newPosition.y = nextPos.y;
      }

      return [
        ...history,
        {
          position: { ...newPosition },
          isHiragana: newIsHiragana,
          charIndex: i,
          action,
          inputChar: currentInputChar,
        },
      ];
    }

    stepCount += sequence.actions.length;
  }

  return history;
};

export const usePlayback = (
  inputText: string,
  currentVersion: GameVersion,
  sequences: ReturnType<typeof findInputSequence>,
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [stateHistory, setStateHistory] = useState<StateHistory[]>(initialHistory);

  const totalSteps = useMemo(
    () => sequences.reduce((sum, seq) => sum + seq.actions.length, 0),
    [sequences],
  );

  // 履歴が唯一の状態源。現在位置・モード・ステップ数はすべてここから導出する
  const currentState = stateHistory[stateHistory.length - 1];
  const currentStep = stateHistory.length - 1;

  const handleStepForward = useCallback(() => {
    setStateHistory((prev) => advanceHistory(prev, sequences, currentVersion));
  }, [sequences, currentVersion]);

  const handleStepBackward = useCallback(() => {
    setStateHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setStateHistory(initialHistory());
  }, []);

  const handlePlayPause = useCallback(() => {
    if (currentStep >= totalSteps) {
      handleReset();
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  }, [currentStep, totalSteps, isPlaying, handleReset]);

  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      handleStepForward();
    }, BASE_STEP_INTERVAL_MS / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, handleStepForward]);

  useEffect(() => {
    handleReset();
  }, [inputText, currentVersion, handleReset]);

  return {
    isPlaying,
    currentStep,
    currentCharIndex: currentState.charIndex,
    currentAction: currentState.action,
    playbackSpeed,
    stateHistory,
    currentPosition: currentState.position,
    isHiragana: currentState.isHiragana,
    totalSteps,
    handleStepForward,
    handleStepBackward,
    handlePlayPause,
    handleReset,
    handleSpeedChange: setPlaybackSpeed,
  };
};
