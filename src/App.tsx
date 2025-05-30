import { type FC } from 'react';
import { CharacterGrid } from './components/CharacterGrid';
import { InputSequence } from './components/InputSequence';
import { createGrid } from './data/characterGrids';
import { UI_CONSTANTS } from './constants/ui';
import { useInputProcessing } from './hooks/useInputProcessing';
import { usePlayback } from './hooks/usePlayback';
import { useResponsive } from './hooks/useResponsive';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconButton, Slider, Tooltip } from '@mui/material';


const App: FC = () => {
  const { inputText, currentVersion, sequences, handleTextChange, handleVersionChange } = useInputProcessing();
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
    handleSpeedChange
  } = usePlayback(inputText, currentVersion, sequences);
  const { isMobile } = useResponsive();


  return (
    <div style={{
      maxWidth: `${UI_CONSTANTS.LAYOUT.MAX_WIDTH}px`,
      margin: '0 auto',
      padding: `${UI_CONSTANTS.LAYOUT.CONTAINER_PADDING}px`,
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : `1fr ${UI_CONSTANTS.LAYOUT.SIDEBAR_WIDTH}px`,
      gap: `${UI_CONSTANTS.LAYOUT.SECTION_GAP}px`
    }}>
      <div>
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px'
        }}>
          <label>
            <select
              value={currentVersion}
              onChange={handleVersionChange}
              style={{
                padding: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="GEN1">gen-1 nickname</option>
              <option value="GEN2_NICKNAME">gen-2 nickname</option>
              <option value="GEN2_BOX">gen-2 box</option>
              <option value="GEN2_MAIL">gen-2 mail</option>
            </select>
          </label>
        </div>

        <div style={{
          marginBottom: '20px',
          width: '100%'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={handleTextChange}
            placeholder={(currentVersion === 'GEN1' || currentVersion === "GEN2_NICKNAME") ? "Enter nickname" : currentVersion === 'GEN2_BOX' ? "Enter box name" : "Enter mail"}
            style={{
              width: '100%',
              padding: `${UI_CONSTANTS.GRID.PADDING}px`,
              fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_INPUT}px`,
              borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <Tooltip title={isPlaying ? 'Pause' : currentStep >= totalSteps ? 'Play from start' : 'Play'}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="large"
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset">
              <IconButton
                onClick={handleReset}
                color="primary"
                size="large"
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Previous">
              <span>
                <IconButton
                  onClick={handleStepBackward}
                  disabled={currentStep === 0}
                  color="primary"
                  size="large"
                >
                  <ArrowBackIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Next">
              <span>
                <IconButton
                  onClick={handleStepForward}
                  disabled={currentStep >= totalSteps}
                  color="primary"
                  size="large"
                >
                  <ArrowForwardIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: isMobile ? '100%' : '200px'
          }}>
            <Tooltip title="Playback Speed">
              <SpeedIcon color="primary" />
            </Tooltip>
            <Slider
              value={1000 - playbackSpeed}
              onChange={handleSpeedChange}
              min={0}
              max={900}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${((1000 - value) / 1000).toFixed(2)}s`}
            />
          </div>

          <div style={{
            color: UI_CONSTANTS.COLORS.TEXT_MUTED,
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Step: {currentStep} / {totalSteps}
          </div>
        </div>

        <CharacterGrid
          grid={createGrid(currentVersion, isHiragana)}
          currentPosition={currentPosition}
          currentAction={currentAction}
        />
      </div>

      <div style={{
        position: isMobile ? 'static' : 'sticky',
        top: '20px',
        alignSelf: 'start',
        marginTop: isMobile ? '20px' : '0'
      }}>
        <InputSequence
          sequences={sequences}
          currentStep={currentStep}
          currentCharIndex={currentCharIndex}
          stateHistory={stateHistory}
        />
      </div>
    </div>
  );
};

export default App;
