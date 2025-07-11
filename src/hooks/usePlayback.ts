import { createGrid } from "../data/characterGrids";
import { GameVersion, InputAction, StateHistory } from "../types";
import { MAX_CHAR_LIMITS, DAKUTEN_REVERSE_MAP } from "../utils/constants";
import { calculateNextPosition, getConfirmButtonPosition } from "../utils/gridNavigation";
import { findInputSequence } from "../utils/pathfinder";
import { useState, useCallback, useEffect, useMemo } from "react";

export const usePlayback = (
  inputText: string,
  currentVersion: GameVersion,
  sequences: ReturnType<typeof findInputSequence>,
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState<InputAction | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [stateHistory, setStateHistory] = useState<StateHistory[]>([]);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isHiragana, setIsHiragana] = useState(false);

  const totalSteps = useMemo(() => sequences.reduce((sum, seq) => sum + seq.actions.length, 0), [sequences]);

  const calculateDisplayTextLength = useCallback((history: StateHistory[]): number => {
    let text = "";
    let lastChar = "";

    for (let i = 0; i < history.length; i++) {
      const state = history[i];

      if (state.action === "B") {
        if (text.length > 0) {
          text = text.substring(0, text.length - 1);
          lastChar = text.length > 0 ? text[text.length - 1] : "";
        }
      } else if (state.action === "A" && state.inputChar) {
        if (state.inputChar === "゛" || state.inputChar === "゜") {
          if (lastChar && DAKUTEN_REVERSE_MAP[lastChar]?.[state.inputChar]) {
            text = text.substring(0, text.length - 1) + DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
            lastChar = DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
          }
        } else if (state.inputChar !== "ED" && state.inputChar !== "かな" && state.inputChar !== "カナ") {
          text += state.inputChar;
          lastChar = state.inputChar;
        }
      }
    }

    return text.length;
  }, []);

  const handleStepForward = useCallback(() => {
    if (currentStep >= totalSteps) return;

    let stepCount = 0;
    let charIndex = 0;
    let inputCharCount = 0;
    const newPosition = { ...currentPosition };
    let newIsHiragana = isHiragana;
    let currentInputChar: string | null = null;

    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];
      if (sequence.char !== "゛" && sequence.char !== "゜") {
        inputCharCount++;
      }
      if (stepCount + sequence.actions.length > currentStep) {
        charIndex = i;
        const actionIndex = currentStep - stepCount;
        const action = sequence.actions[actionIndex];

        setCurrentAction(action);

        if (action === "s") {
          newIsHiragana = !newIsHiragana;
        } else if (action === "S" && currentVersion !== "GEN1") {
          if (currentVersion === "GEN2_NICKNAME" || currentVersion === "GEN2_BOX") {
            newPosition.x = 14;
            newPosition.y = 4;
          } else if (currentVersion === "GEN2_MAIL") {
            newPosition.x = 15;
            newPosition.y = 4;
          }
        } else if (action === "A") {
          const grid = createGrid(currentVersion, newIsHiragana);
          const charAtPosition = grid.grid.find((item) => item.x === newPosition.x && item.y === newPosition.y);

          if (charAtPosition) {
            currentInputChar = charAtPosition.char;
          }

          const tempHistory = [
            ...stateHistory,
            {
              position: { ...newPosition },
              isHiragana: newIsHiragana,
              charIndex,
              action,
              inputChar: currentInputChar,
            },
          ];

          const newTextLength = calculateDisplayTextLength(tempHistory);

          if (
            newTextLength >= MAX_CHAR_LIMITS[currentVersion] &&
            currentInputChar &&
            currentInputChar !== "ED" &&
            currentInputChar !== "かな" &&
            currentInputChar !== "カナ"
          ) {
            const confirmPos = getConfirmButtonPosition(currentVersion);
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

        setStateHistory((prev) => [
          ...prev,
          {
            position: { ...newPosition },
            isHiragana: newIsHiragana,
            charIndex,
            action,
            inputChar: currentInputChar,
          },
        ]);

        break;
      }

      stepCount += sequence.actions.length;
    }

    setCurrentStep((prev) => prev + 1);
    setCurrentCharIndex(charIndex);
    setCurrentPosition(newPosition);
    setIsHiragana(newIsHiragana);
  }, [
    currentStep,
    totalSteps,
    currentPosition,
    isHiragana,
    sequences,
    currentVersion,
    stateHistory,
    calculateDisplayTextLength,
  ]);

  const handleStepBackward = useCallback(() => {
    if (currentStep <= 0) return;

    const newStep = currentStep - 1;
    const previousState = stateHistory[newStep];

    setCurrentStep(newStep);
    setCurrentCharIndex(previousState.charIndex);
    setCurrentPosition(previousState.position);
    setIsHiragana(previousState.isHiragana);
    setCurrentAction(previousState.action);

    setStateHistory((prev) => prev.slice(0, -1));
  }, [currentStep, stateHistory]);

  const handlePlayPause = useCallback(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
      setCurrentPosition({ x: 0, y: 0 });
      setCurrentCharIndex(0);
      setIsHiragana(false);
      setStateHistory([
        {
          position: { x: 0, y: 0 },
          isHiragana: false,
          charIndex: 0,
          action: null,
          inputChar: null,
        },
      ]);
    }
    setIsPlaying(!isPlaying);
  }, [currentStep, totalSteps, isPlaying]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setCurrentPosition({ x: 0, y: 0 });
    setCurrentCharIndex(0);
    setIsPlaying(false);
    setIsHiragana(false);
    setStateHistory([
      {
        position: { x: 0, y: 0 },
        isHiragana: false,
        charIndex: 0,
        action: null,
        inputChar: null,
      },
    ]);
  }, []);

  const handleSpeedChange = useCallback((_event: Event, value: number | number[]) => {
    setPlaybackSpeed(1000 - (Array.isArray(value) ? value[0] : value));
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      handleStepForward();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, handleStepForward]);

  useEffect(() => {
    if (sequences.length > 0) {
      setStateHistory([
        {
          position: { x: 0, y: 0 },
          isHiragana: false,
          charIndex: 0,
          action: null,
          inputChar: null,
        },
      ]);
    }
  }, [sequences]);

  useEffect(() => {
    handleReset();
  }, [inputText, currentVersion]);

  return {
    isPlaying,
    currentStep,
    currentCharIndex,
    currentAction,
    playbackSpeed,
    stateHistory,
    currentPosition,
    isHiragana,
    totalSteps,
    handleStepForward,
    handleStepBackward,
    handlePlayPause,
    handleReset,
    handleSpeedChange,
  };
};
