import { UI_CONSTANTS } from "../constants/ui";
import type { InputPath, StateHistory } from "../types";
import { getDisplayText } from "../utils/characterMapping";
import { Text } from "@primer/react";

interface InputSequenceProps {
  sequences: InputPath[];
  currentStep: number;
  currentCharIndex: number;
  stateHistory: StateHistory[];
}

export const InputSequence = ({
  sequences,
  currentStep,
  currentCharIndex,
  stateHistory,
}: InputSequenceProps) => {
  const currentText = getDisplayText(stateHistory);

  // 各シーケンスの開始ステップ番号と総ステップ数を1パスで計算
  const stepOffsets: number[] = [];
  let totalSteps = 0;
  for (const sequence of sequences) {
    stepOffsets.push(totalSteps);
    totalSteps += sequence.actions.length;
  }

  const formatText = (text: string) => {
    const lines = text.match(/.{1,16}/g) || [];
    return lines.join("\n");
  };

  const getActionStepColors = (isCurrentAction: boolean, isCompleted: boolean) => {
    if (isCurrentAction) {
      return {
        backgroundColor: "var(--bgColor-accent-emphasis)",
        color: "var(--fgColor-onEmphasis)",
      };
    }
    if (isCompleted) {
      return {
        backgroundColor: "var(--bgColor-success-muted)",
        color: "var(--fgColor-default)",
      };
    }
    return {
      backgroundColor: "var(--bgColor-accent-muted)",
      color: "var(--fgColor-default)",
    };
  };

  return (
    <div className="input-sequence">
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "var(--bgColor-muted)",
          borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
          fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_DISPLAY}px`,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
        className="sequence-display"
      >
        <div>
          {formatText(currentText)}
          <span style={{ animation: "blink 1s infinite" }}>|</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sequences.map((sequence, index) => {
          const displayChar = sequence.char;
          const stepCount = stepOffsets[index];
          const isCurrentSequence = index === currentCharIndex;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: isCurrentSequence
                  ? "var(--bgColor-accent-muted)"
                  : "var(--bgColor-default)",
                borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
                transition: `background-color ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}`,
              }}
              className={`sequence-item ${isCurrentSequence ? "current" : ""}`}
            >
              <Text
                style={{
                  marginRight: "8px",
                  fontWeight: "bold",
                  minWidth: "2em",
                  fontFamily: "monospace",
                }}
              >
                {displayChar}:
              </Text>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {sequence.actions.map((action, actionIndex) => {
                  const isCurrentAction = stepCount + actionIndex === currentStep;
                  const isCompleted = stepCount + actionIndex < currentStep;
                  return (
                    <span
                      key={actionIndex}
                      style={{
                        padding: "4px 8px",
                        ...getActionStepColors(isCurrentAction, isCompleted),
                        borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
                        fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_BODY}px`,
                        transition: `all ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}`,
                      }}
                      className={`action-step ${isCurrentAction ? "current" : ""} ${isCompleted ? "completed" : ""}`}
                    >
                      {action}
                    </span>
                  );
                })}
              </div>
              <Text style={{ marginLeft: "auto", color: "var(--fgColor-muted)" }}>
                {sequence.actions.length} steps
              </Text>
            </div>
          );
        })}
      </div>
      <Text as="div" style={{ color: "var(--fgColor-muted)" }}>
        Total steps: {totalSteps}
      </Text>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};
