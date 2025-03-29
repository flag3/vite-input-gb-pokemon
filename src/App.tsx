import React, { useState, useEffect } from 'react';
import { CharacterGrid } from './components/CharacterGrid';
import { InputSequence } from './components/InputSequence';
import { GRIDS, createGrid } from './data/characterGrids';
import { findInputSequence } from './utils/pathfinder';
import { decomposeTextWithMode } from './utils/characterMapping';
import { GameVersion, InputAction } from './types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconButton, Slider, Tooltip } from '@mui/material';

const MAX_CHAR_LIMITS: Record<GameVersion, number> = {
  GEN1: 5,
  GEN2_BOX: 8,
  GEN2_MAIL: 32
};

interface StateHistory {
  position: { x: number; y: number };
  isHiragana: boolean;
  charIndex: number;
  action: InputAction | null;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [currentVersion, setCurrentVersion] = useState<GameVersion>('GEN1');
  const [isHiragana, setIsHiragana] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [sequences, setSequences] = useState<ReturnType<typeof findInputSequence>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState<InputAction | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [stateHistory, setStateHistory] = useState<StateHistory[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const totalSteps = sequences.reduce((sum, seq) => sum + seq.actions.length, 0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      let stepCount = 0;
      let charIndex = 0;
      let inputCharCount = 0;
      const newPosition = { ...currentPosition };
      let newIsHiragana = isHiragana;

      for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i];
        if (sequence.char !== '゛' && sequence.char !== '゜') {
          inputCharCount++;
        }
        if (stepCount + sequence.actions.length > currentStep) {
          charIndex = i;
          const actionIndex = currentStep - stepCount;
          const action = sequence.actions[actionIndex];

          setCurrentAction(action);

          if (action === 's') {
            newIsHiragana = !newIsHiragana;
          } else if (action === 'S' && currentVersion !== 'GEN1') {
            if (currentVersion === 'GEN2_BOX') {
              newPosition.x = 14;
              newPosition.y = 4;
            } else if (currentVersion === 'GEN2_MAIL') {
              newPosition.x = 15;
              newPosition.y = 4;
            }
          } else if (action === 'A') {
            if (currentVersion === 'GEN1') {
              if (inputCharCount === 5) {
                const grid = createGrid(currentVersion, newIsHiragana);
                newPosition.x = grid.width - 1;
                newPosition.y = grid.height - 2;
              }
            } else {
              const charLimit = currentVersion === 'GEN2_BOX' ? 8 : 32;
              if (inputCharCount === charLimit) {
                if (currentVersion === 'GEN2_BOX') {
                  newPosition.x = 14;
                  newPosition.y = 4;
                } else {
                  newPosition.x = 15;
                  newPosition.y = 4;
                }
              }
            }
          } else {
            const grid = createGrid(currentVersion, newIsHiragana);
            const currentRow = grid.grid.filter(pos => pos.y === newPosition.y);

            switch (action) {
              case '↑':
                if (currentVersion === 'GEN1') {
                  if (newPosition.y === 0) {
                    newPosition.y = 6;
                    newPosition.x = 0;
                  } else if (newPosition.y === 6) {
                    newPosition.y = 5;
                  } else {
                    newPosition.y = Math.max(0, newPosition.y - 1);
                  }
                } else {
                  newPosition.y = Math.max(0, newPosition.y - 1);
                }
                break;
              case '↓':
                if (currentVersion === 'GEN1') {
                  if (newPosition.y === 5 && newPosition.x === 0) {
                    newPosition.y = 6;
                  } else if (newPosition.y === 6) {
                    newPosition.y = 0;
                  } else {
                    newPosition.y = Math.min(5, newPosition.y + 1);
                  }
                } else {
                  newPosition.y = Math.min(4, newPosition.y + 1);
                }
                break;
              case '←':
                if (currentVersion === 'GEN1' && newPosition.y === 6) {
                  newPosition.x = 0;
                } else {
                  const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
                  if (newPosition.x === positions[0]) {
                    newPosition.x = positions[positions.length - 1];
                  } else {
                    newPosition.x = positions[positions.findIndex(x => x === newPosition.x) - 1];
                  }
                }
                break;
              case '→':
                if (currentVersion === 'GEN1' && newPosition.y === 6) {
                  newPosition.x = 0;
                } else {
                  const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
                  if (newPosition.x === positions[positions.length - 1]) {
                    newPosition.x = positions[0];
                  } else {
                    newPosition.x = positions[positions.findIndex(x => x === newPosition.x) + 1];
                  }
                }
                break;
            }
          }

          setStateHistory(prev => [...prev, {
            position: { ...newPosition },
            isHiragana: newIsHiragana,
            charIndex,
            action
          }]);

          break;
        }
        stepCount += sequence.actions.length;
      }

      setCurrentStep(prev => prev + 1);
      setCurrentCharIndex(charIndex);
      setCurrentPosition(newPosition);
      setIsHiragana(newIsHiragana);
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, sequences, currentPosition, currentVersion, playbackSpeed, isHiragana]);

  useEffect(() => {
    if (sequences.length > 0) {
      setStateHistory([{
        position: { x: 0, y: 0 },
        isHiragana: false,
        charIndex: 0,
        action: null
      }]);
    }
  }, [sequences]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.replace(/　/g, ' ');
    const maxLength = MAX_CHAR_LIMITS[currentVersion];
    const truncatedText = text.slice(0, maxLength);

    setInputText(truncatedText);
    setCurrentStep(0);
    setCurrentCharIndex(0);
    setCurrentPosition({ x: 0, y: 0 });
    setIsPlaying(false);
    setIsHiragana(false);
    if (truncatedText) {
      const grid = { ...GRIDS[currentVersion], isHiragana: false };
      const { chars, modes } = decomposeTextWithMode(truncatedText, false, currentVersion);
      const newSequences = findInputSequence(grid, chars.join(''), modes);
      setSequences(newSequences);
    } else {
      setSequences([{
        char: 'END',
        actions: ['↓', '↓', '↓', '↓', '↓', '→', '→', '→', '→', '→', '→', 'A'],
        totalSteps: 12
      }]);
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const version = e.target.value as GameVersion;
    setCurrentVersion(version);
    setCurrentPosition({ x: 0, y: 0 });
    setCurrentStep(0);
    setCurrentCharIndex(0);
    setIsPlaying(false);
    setIsHiragana(false);
    if (inputText) {
      const grid = { ...GRIDS[version], isHiragana: false };
      const { chars, modes } = decomposeTextWithMode(inputText, false, version);
      const newSequences = findInputSequence(grid, chars.join(''), modes);
      setSequences(newSequences);
    }
  };

  const handlePlayPause = () => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
      setCurrentPosition({ x: 0, y: 0 });
      setCurrentCharIndex(0);
      setIsHiragana(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCurrentPosition({ x: 0, y: 0 });
    setCurrentCharIndex(0);
    setIsPlaying(false);
    setIsHiragana(false);
  };

  const handleSpeedChange = (_event: Event, value: number | number[]) => {
    setPlaybackSpeed(1000 - (Array.isArray(value) ? value[0] : value));
  };

  const handleStepForward = () => {
    if (currentStep >= totalSteps) return;

    let stepCount = 0;
    let charIndex = 0;
    let inputCharCount = 0;
    const newPosition = { ...currentPosition };
    let newIsHiragana = isHiragana;

    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];
      if (sequence.char !== '゛' && sequence.char !== '゜') {
        inputCharCount++;
      }
      if (stepCount + sequence.actions.length > currentStep) {
        charIndex = i;
        const actionIndex = currentStep - stepCount;
        const action = sequence.actions[actionIndex];

        setCurrentAction(action);

        if (action === 's') {
          newIsHiragana = !newIsHiragana;
        } else if (action === 'S' && currentVersion !== 'GEN1') {
          if (currentVersion === 'GEN2_BOX') {
            newPosition.x = 14;
            newPosition.y = 4;
          } else if (currentVersion === 'GEN2_MAIL') {
            newPosition.x = 15;
            newPosition.y = 4;
          }
        } else if (action === 'A') {
          if (currentVersion === 'GEN1') {
            if (inputCharCount === 5) {
              const grid = createGrid(currentVersion, newIsHiragana);
              newPosition.x = grid.width - 1;
              newPosition.y = grid.height - 2;
            }
          } else {
            const charLimit = currentVersion === 'GEN2_BOX' ? 8 : 32;
            if (inputCharCount === charLimit) {
              if (currentVersion === 'GEN2_BOX') {
                newPosition.x = 14;
                newPosition.y = 4;
              } else {
                newPosition.x = 15;
                newPosition.y = 4;
              }
            }
          }
        } else {
          const grid = createGrid(currentVersion, newIsHiragana);
          const currentRow = grid.grid.filter(pos => pos.y === newPosition.y);

          switch (action) {
            case '↑':
              if (currentVersion === 'GEN1') {
                if (newPosition.y === 0) {
                  newPosition.y = 6;
                  newPosition.x = 0;
                } else {
                  newPosition.y = Math.max(0, newPosition.y - 1);
                }
              } else {
                if (newPosition.y === 0) {
                  newPosition.y = 4;
                } else {
                  newPosition.y = Math.max(0, newPosition.y - 1);
                }
              }
              break;
            case '↓':
              if (currentVersion === 'GEN1') {
                if (newPosition.y === 5) {
                  newPosition.x = 0;
                  newPosition.y = 6;
                } else if (newPosition.y === 6) {
                  newPosition.y = 0;
                } else {
                  newPosition.y = Math.min(5, newPosition.y + 1);
                }
              } else {
                if (newPosition.y === 4) {
                  newPosition.y = 0;
                } else {
                  newPosition.y = Math.min(4, newPosition.y + 1);
                }
              }
              break;
            case '←':
              if (currentVersion === 'GEN1' && newPosition.y === 6) {
                newPosition.x = 0;
              } else {
                const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
                if (newPosition.x === positions[0]) {
                  newPosition.x = positions[positions.length - 1];
                } else {
                  newPosition.x = positions[positions.findIndex(x => x === newPosition.x) - 1];
                }
              }
              break;
            case '→':
              if (currentVersion === 'GEN1' && newPosition.y === 6) {
                newPosition.x = 0;
              } else {
                const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);
                if (newPosition.x === positions[positions.length - 1]) {
                  newPosition.x = positions[0];
                } else {
                  newPosition.x = positions[positions.findIndex(x => x === newPosition.x) + 1];
                }
              }
              break;
          }
        }

        setCurrentAction(action);

        setStateHistory(prev => [...prev, {
          position: { ...newPosition },
          isHiragana: newIsHiragana,
          charIndex,
          action
        }]);

        break;
      }

      stepCount += sequence.actions.length;
    }

    setCurrentStep(prev => prev + 1);
    setCurrentCharIndex(charIndex);
    setCurrentPosition(newPosition);
    setIsHiragana(newIsHiragana);
  };

  const handleStepBackward = () => {
    if (currentStep <= 0) return;

    const newStep = currentStep - 1;
    const previousState = stateHistory[newStep];

    setCurrentStep(newStep);
    setCurrentCharIndex(previousState.charIndex);
    setCurrentPosition(previousState.position);
    setIsHiragana(previousState.isHiragana);
    setCurrentAction(previousState.action);

    setStateHistory(prev => prev.slice(0, -1));
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
      gap: '40px'
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
            placeholder={currentVersion === 'GEN1' ? "Enter nickname" : currentVersion === 'GEN2_BOX' ? "Enter box name" : "Enter mail"}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
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
            color: '#666',
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
        />
      </div>
    </div>
  );
}

export default App;
