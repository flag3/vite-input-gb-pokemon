import { createGrid } from "../constants/characterGrids";
import { useInputProcessing } from "../hooks/useInputProcessing";
import { usePlayback } from "../hooks/usePlayback";
import { useResponsive } from "../hooks/useResponsive";
import { CharacterGrid } from "./CharacterGrid";
import { InputControls } from "./InputControls";
import { InputSequence } from "./InputSequence";
import { SimulatorLayout } from "./SimulatorLayout";
import { type FC } from "react";

const InputSimulator: FC = () => {
  const {
    inputText,
    currentVersion,
    sequences,
    handleTextChange,
    handleVersionChange,
  } = useInputProcessing();
  const {
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
  } = usePlayback(inputText, currentVersion, sequences);
  const { isMobile } = useResponsive();

  return (
    <SimulatorLayout isMobile={isMobile}>
      <div>
        <InputControls
          inputText={inputText}
          currentVersion={currentVersion}
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={totalSteps}
          playbackSpeed={playbackSpeed}
          isMobile={isMobile}
          onTextChange={handleTextChange}
          onVersionChange={handleVersionChange}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
        />

        <CharacterGrid
          grid={createGrid(currentVersion, isHiragana)}
          currentPosition={currentPosition}
          currentAction={currentAction}
        />
      </div>

      <InputSequence
        sequences={sequences}
        currentStep={currentStep}
        currentCharIndex={currentCharIndex}
        stateHistory={stateHistory}
        isMobile={isMobile}
      />
    </SimulatorLayout>
  );
};

export default InputSimulator;
