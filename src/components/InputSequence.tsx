import { UI_CONSTANTS } from "../constants/ui";
import type { InputPath, StateHistory } from "../types";
import { getDisplayText } from "../utils/characterMapping";
import React from "react";

interface InputSequenceProps {
  sequences: InputPath[];
  currentStep: number;
  currentCharIndex: number;
  stateHistory: StateHistory[];
}

export const InputSequence: React.FC<InputSequenceProps> = ({
  sequences,
  currentStep,
  currentCharIndex,
  stateHistory,
}) => {
  const currentText = getDisplayText(stateHistory);

  const formatText = (text: string) => {
    const lines = text.match(/.{1,16}/g) || [];
    return lines.join("\n");
  };

  return (
    <div className="input-sequence">
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: UI_CONSTANTS.COLORS.CARD_LIGHT,
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
          const stepCount = sequences
            .slice(0, index)
            .reduce((sum, seq) => sum + seq.actions.length, 0);
          const isCurrentSequence = index === currentCharIndex;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: isCurrentSequence ? "#e3f2fd" : "white",
                borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
                transition: `background-color ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}`,
              }}
              className={`sequence-item ${isCurrentSequence ? "current" : ""}`}
            >
              <span
                style={{
                  marginRight: "8px",
                  fontWeight: "bold",
                  minWidth: "2em",
                  fontFamily: "monospace",
                }}
              >
                {displayChar}:
              </span>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {sequence.actions.map((action, actionIndex) => {
                  const isCurrentAction = stepCount + actionIndex === currentStep;
                  const isCompleted = stepCount + actionIndex < currentStep;
                  return (
                    <span
                      key={actionIndex}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: isCurrentAction
                          ? UI_CONSTANTS.COLORS.PRIMARY
                          : isCompleted
                            ? "#a5d6a7"
                            : "#e3f2fd",
                        color: isCurrentAction ? "white" : "black",
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
              <span
                style={{
                  marginLeft: "auto",
                  color: UI_CONSTANTS.COLORS.TEXT_MUTED,
                }}
              >
                {sequence.actions.length} steps
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ color: UI_CONSTANTS.COLORS.TEXT_MUTED }}>
        Total steps: {sequences.reduce((sum, seq) => sum + seq.actions.length, 0)}
      </div>
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .sequence-display {
              background-color: ${UI_CONSTANTS.COLORS.BACKGROUND_DARK} !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .sequence-item {
              background-color: ${UI_CONSTANTS.COLORS.CARD_DARK} !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .sequence-item.current {
              background-color: #1e3a5f !important;
            }
            .action-step {
              background-color: #1e3a5f !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .action-step.current {
              background-color: ${UI_CONSTANTS.COLORS.SECONDARY} !important;
              color: white !important;
            }
            .action-step.completed {
              background-color: #2d5f3e !important;
              color: white !important;
            }
            .sequence-item span {
              color: rgba(255, 255, 255, 0.7) !important;
            }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};
