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

  const totalSteps = sequences.reduce((sum, seq) => sum + seq.actions.length, 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          handleMove('↑');
          break;
        case 'ArrowDown':
          handleMove('↓');
          break;
        case 'ArrowLeft':
          handleMove('←');
          break;
        case 'ArrowRight':
          handleMove('→');
          break;
        case 'a':
        case 'A':
          handleAction();
          break;
        case 's':
        case 'S':
          setIsHiragana(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

          if (inputCharCount === 5 && action === 'A') {
            newPosition.x = 8;
            newPosition.y = 5;
          } else if (action === 's') {
            newIsHiragana = !newIsHiragana;
          } else if (action === 'A') {
            if (newPosition.x === 0 && newPosition.y === 6) {
              newIsHiragana = !newIsHiragana;
            }
          } else {
            const grid = createGrid(currentVersion, newIsHiragana);
            const currentRow = grid.grid.filter(pos => pos.y === newPosition.y);

            switch (action) {
              case '↑':
                if (newPosition.y === 0) {
                  newPosition.y = 6;
                  newPosition.x = 0;
                } else if (newPosition.y === 6) {
                  newPosition.y = 5;
                } else {
                  newPosition.y = Math.max(0, newPosition.y - 1);
                }
                break;
              case '↓':
                if (newPosition.y === 5 && newPosition.x === 0) {
                  newPosition.y = 6;
                } else if (newPosition.y === 6) {
                  newPosition.y = 0;
                } else {
                  newPosition.y = Math.min(5, newPosition.y + 1);
                }
                break;
              case '←':
                if (newPosition.y === 6) {
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
                if (newPosition.y === 6) {
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
    setInputText(text);
    setCurrentStep(0);
    setCurrentCharIndex(0);
    setCurrentPosition({ x: 0, y: 0 });
    setIsPlaying(false);
    setIsHiragana(false);
    if (text) {
      const grid = { ...GRIDS[currentVersion], isHiragana: false };
      const { chars, modes } = decomposeTextWithMode(text, false);
      const newSequences = findInputSequence(grid, chars.join(''), modes);

      if (newSequences.length > 0) {
        const endAction = chars.length <= 4 ? 'S' : 'A';
        newSequences.push({
          char: 'END',
          actions: [endAction],
          totalSteps: 1
        });
      }

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
      const { chars, modes } = decomposeTextWithMode(inputText, false);
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

        if (inputCharCount === 5 && action === 'A') {
          newPosition.x = 8;
          newPosition.y = 5;
        } else if (action === 's') {
          newIsHiragana = !newIsHiragana;
        } else if (action === 'A') {
          if (newPosition.x === 0 && newPosition.y === 6) {
            newIsHiragana = !newIsHiragana;
          }
        } else if (action !== 'B') {
          const grid = createGrid(currentVersion, newIsHiragana);
          const currentRow = grid.grid.filter(pos => pos.y === newPosition.y);
          const positions = currentRow.map(pos => pos.x).sort((a, b) => a - b);

          switch (action) {
            case '↑':
              if (newPosition.y === 0) {
                newPosition.y = 6;
                newPosition.x = 0;
              } else if (newPosition.y === 6) {
                newPosition.y = 5;
              } else {
                newPosition.y = Math.max(0, newPosition.y - 1);
              }
              break;
            case '↓':
              if (newPosition.y === 5 && newPosition.x === 0) {
                newPosition.y = 6;
              } else if (newPosition.y === 6) {
                newPosition.y = 0;
              } else {
                newPosition.y = Math.min(5, newPosition.y + 1);
              }
              break;
            case '←':
              if (newPosition.y === 6) {
                newPosition.x = 0;
              } else {
                if (newPosition.x === positions[0]) {
                  newPosition.x = positions[positions.length - 1];
                } else {
                  newPosition.x = positions[positions.findIndex(x => x === newPosition.x) - 1];
                }
              }
              break;
            case '→':
              if (newPosition.y === 6) {
                newPosition.x = 0;
              } else {
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

  const handleMove = (direction: InputAction) => {
    const newPosition = { ...currentPosition };
    const grid = createGrid(currentVersion, isHiragana);
    const currentRow = grid.grid.filter(pos => pos.y === currentPosition.y);

    switch (direction) {
      case '↑':
        if (newPosition.y === 0) {
          newPosition.y = 6;
          newPosition.x = 0;
        } else if (newPosition.y === 6) {
          newPosition.y = 5;
        } else {
          newPosition.y = Math.max(0, newPosition.y - 1);
        }
        break;
      case '↓':
        if (newPosition.y === 5 && newPosition.x === 0) {
          newPosition.y = 6;
        } else if (newPosition.y === 6) {
          newPosition.y = 0;
        } else {
          newPosition.y = Math.min(5, newPosition.y + 1);
        }
        break;
      case '←':
        if (newPosition.y === 6) {
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
        if (newPosition.y === 6) {
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
    setCurrentPosition(newPosition);
  };

  const handleAction = () => {
    if (currentPosition.x === 0 && currentPosition.y === 6) {
      setIsHiragana(prev => !prev);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '40px'
    }}>
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label>
            <select
              value={currentVersion}
              onChange={handleVersionChange}
              style={{ marginLeft: '8px', padding: '4px' }}
            >
              <option value="GEN1">gen-1 nickname</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter nickname"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '16px',
            minWidth: '200px'
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

          <div style={{ marginLeft: '16px', color: '#666' }}>
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
        position: 'sticky',
        top: '20px',
        alignSelf: 'start'
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
