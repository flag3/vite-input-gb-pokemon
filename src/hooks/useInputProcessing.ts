import { GRIDS } from "../data/characterGrids";
import { GameVersion } from "../types";
import { decomposeTextWithMode, normalizeSpaces } from "../utils/characterMapping";
import { MAX_CHAR_LIMITS } from "../utils/constants";
import { findInputSequence } from "../utils/pathfinder";
import { useState, useCallback } from "react";

export const useInputProcessing = () => {
  const [inputText, setInputText] = useState("");
  const [currentVersion, setCurrentVersion] = useState<GameVersion>("GEN1");
  const [sequences, setSequences] = useState<ReturnType<typeof findInputSequence>>([]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = normalizeSpaces(e.target.value);
      const maxLength = MAX_CHAR_LIMITS[currentVersion];
      const truncatedText = text.slice(0, maxLength);

      setInputText(truncatedText);

      if (truncatedText) {
        const grid = { ...GRIDS[currentVersion], isHiragana: false };
        const { chars, modes } = decomposeTextWithMode(truncatedText, false, currentVersion);
        const newSequences = findInputSequence(grid, chars.join(""), modes);
        setSequences(newSequences);
      } else {
        setSequences([]);
      }
    },
    [currentVersion],
  );

  const handleVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const version = e.target.value as GameVersion;
      setCurrentVersion(version);

      if (inputText) {
        const grid = { ...GRIDS[version], isHiragana: false };
        const { chars, modes } = decomposeTextWithMode(inputText, false, version);
        const newSequences = findInputSequence(grid, chars.join(""), modes);
        setSequences(newSequences);
      }
    },
    [inputText],
  );

  return {
    inputText,
    currentVersion,
    sequences,
    handleTextChange,
    handleVersionChange,
  };
};
