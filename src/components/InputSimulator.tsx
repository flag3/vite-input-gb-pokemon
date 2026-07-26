import { createGrid } from "../constants/characterGrids";
import { useInputProcessing } from "../hooks/useInputProcessing";
import { usePlayback } from "../hooks/usePlayback";
import { CharacterGrid } from "./CharacterGrid";
import { InputControls } from "./InputControls";
import { InputSequence } from "./InputSequence";

const InputSimulator = () => {
  const {
    inputText,
    currentVersion,
    sequences,
    handleTextChange,
    handleCompositionEnd,
    handleVersionChange,
  } = useInputProcessing();
  const {
    isPlaying,
    currentStep,
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

  return (
    <div className="simulator-layout">
      <div>
        <InputControls
          inputText={inputText}
          currentVersion={currentVersion}
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={totalSteps}
          playbackSpeed={playbackSpeed}
          onTextChange={handleTextChange}
          onCompositionEnd={handleCompositionEnd}
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
        />
      </div>

      <InputSequence sequences={sequences} currentStep={currentStep} stateHistory={stateHistory} />
    </div>
  );
};

export default InputSimulator;
