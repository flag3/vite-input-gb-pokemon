import { createGrid } from "../constants/characterGrids";
import { MAX_CHAR_LIMITS } from "../constants/gameConstants";
import type { GameVersion } from "../types";
import { decomposeTextWithMode, normalizeSpaces } from "../utils/characterMapping";
import { findInputSequence } from "../utils/pathfinder";
import { useState, useCallback, useMemo } from "react";

export const useInputProcessing = () => {
  const [inputText, setInputText] = useState("");
  const [currentVersion, setCurrentVersion] = useState<GameVersion>("GEN1");

  const sequences = useMemo(() => {
    if (!inputText) return [];

    const grid = createGrid(currentVersion, false);
    const { chars, modes } = decomposeTextWithMode(inputText, false, currentVersion);
    return findInputSequence(grid, chars.join(""), modes);
  }, [inputText, currentVersion]);

  const clamp = useCallback(
    (text: string) => normalizeSpaces(text).slice(0, MAX_CHAR_LIMITS[currentVersion]),
    [currentVersion],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isComposing = (e.nativeEvent as InputEvent).isComposing;
      setInputText(isComposing ? e.target.value : clamp(e.target.value));
    },
    [clamp],
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      setInputText(clamp(e.currentTarget.value));
    },
    [clamp],
  );

  const handleVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentVersion(e.target.value as GameVersion);
  }, []);

  return {
    inputText,
    currentVersion,
    sequences,
    handleTextChange,
    handleCompositionEnd,
    handleVersionChange,
  };
};
