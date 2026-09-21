import type { InputPath, StateHistory } from "../types";
import { getDisplayText } from "../utils/characterMapping";
import { Label, ProgressBar, Stack, Text } from "@primer/react";

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

      <ProgressBar
        className="sequence-progress"
        progress={totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0}
        aria-label="Playback progress"
        aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
      />

      <Stack gap="condensed">
        {sequences.map((sequence, index) => {
          const stepCount = stepOffsets[index];
          const isCurrentSequence =
            stepCount <= currentStep && currentStep < stepCount + sequence.actions.length;

          return (
            <Stack
              key={index}
              className={`sequence-item ${isCurrentSequence ? "current" : ""}`}
              direction="horizontal"
              align="center"
              gap="none"
              padding="condensed"
            >
              <Text className="sequence-char">{sequence.char === "　" ? "␣" : sequence.char}:</Text>
              <Stack direction="horizontal" gap="tight" wrap="wrap">
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
              </Stack>
              <Label className="sequence-step-count">
                {sequence.actions.length} {sequence.actions.length === 1 ? "step" : "steps"}
              </Label>
            </Stack>
          );
        })}
      </Stack>
      <Text as="div" className="sequence-total">
        Total steps: {totalSteps}
      </Text>
    </div>
  );
};
