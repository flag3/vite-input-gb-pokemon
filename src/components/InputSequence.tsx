import type { InputPath, StateHistory } from "../types";
import { getDisplayText } from "../utils/characterMapping";
import { Text } from "@primer/react";

interface InputSequenceProps {
  sequences: InputPath[];
  currentStep: number;
  stateHistory: StateHistory[];
}

export const InputSequence = ({ sequences, currentStep, stateHistory }: InputSequenceProps) => {
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

  return (
    <div className="input-sequence">
      <div className="sequence-display">
        <div>
          {formatText(currentText)}
          <span className="cursor">|</span>
        </div>
      </div>

      <div className="sequence-list">
        {sequences.map((sequence, index) => {
          const stepCount = stepOffsets[index];
          const isCurrentSequence =
            stepCount <= currentStep && currentStep < stepCount + sequence.actions.length;

          return (
            <div key={index} className={`sequence-item ${isCurrentSequence ? "current" : ""}`}>
              <Text className="sequence-char">{sequence.char === "　" ? "␣" : sequence.char}:</Text>
              <div className="action-steps">
                {sequence.actions.map((action, actionIndex) => {
                  const isCurrentAction = stepCount + actionIndex === currentStep;
                  const isCompleted = stepCount + actionIndex < currentStep;
                  return (
                    <span
                      key={actionIndex}
                      className={`action-step ${isCurrentAction ? "current" : ""} ${isCompleted ? "completed" : ""}`}
                    >
                      {action}
                    </span>
                  );
                })}
              </div>
              <Text className="sequence-step-count">
                {sequence.actions.length} {sequence.actions.length === 1 ? "step" : "steps"}
              </Text>
            </div>
          );
        })}
      </div>
      <Text as="div" className="sequence-total">
        Total steps: {totalSteps}
      </Text>
    </div>
  );
};
