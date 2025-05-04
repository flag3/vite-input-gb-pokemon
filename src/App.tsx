import React, { useState, useEffect, useCallback } from 'react';
import { CharacterGrid } from './components/CharacterGrid';
import { InputSequence } from './components/InputSequence';
import { GRIDS, createGrid } from './data/characterGrids';
import { findInputSequence } from './utils/pathfinder';
import { decomposeTextWithMode, normalizeSpaces } from './utils/characterMapping';
import { GameVersion, InputAction } from './types';
import { MAX_CHAR_LIMITS, DAKUTEN_REVERSE_MAP } from './utils/constants';
import { calculateNextPosition, getConfirmButtonPosition } from './utils/gridNavigation';
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
  inputChar: string | null;
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

  const handleStepForward = useCallback(() => {
    if (currentStep >= totalSteps) return;

    let stepCount = 0;
    let charIndex = 0;
    let inputCharCount = 0;
    const newPosition = { ...currentPosition };
    let newIsHiragana = isHiragana;
    let currentInputChar: string | null = null;

    const calculateDisplayTextLength = (history: StateHistory[]): number => {
      let text = '';
      let lastChar = '';

      for (let i = 0; i < history.length; i++) {
        const state = history[i];

        if (state.action === 'B') {
          if (text.length > 0) {
            text = text.substring(0, text.length - 1);
            lastChar = text.length > 0 ? text[text.length - 1] : '';
          }
        } else if (state.action === 'A' && state.inputChar) {
          if (state.inputChar === '゛' || state.inputChar === '゜') {
            if (lastChar && DAKUTEN_REVERSE_MAP[lastChar]?.[state.inputChar]) {
              text = text.substring(0, text.length - 1) + DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
              lastChar = DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
            }
          } else if (state.inputChar !== 'ED' && state.inputChar !== 'かな' && state.inputChar !== 'カナ') {
            text += state.inputChar;
            lastChar = state.inputChar;
          }
        }
      }

      return text.length;
    };

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
          if (currentVersion === 'GEN2_NICKNAME' || currentVersion === 'GEN2_BOX') {
            newPosition.x = 14;
            newPosition.y = 4;
          } else if (currentVersion === 'GEN2_MAIL') {
            newPosition.x = 15;
            newPosition.y = 4;
          }
        } else if (action === 'A') {
          const grid = createGrid(currentVersion, newIsHiragana);
          const charAtPosition = grid.grid.find(
            item => item.x === newPosition.x && item.y === newPosition.y
          );

          if (charAtPosition) {
            currentInputChar = charAtPosition.char;
          }

          const tempHistory = [...stateHistory, {
            position: { ...newPosition },
            isHiragana: newIsHiragana,
            charIndex,
            action,
            inputChar: currentInputChar
          }];

          const newTextLength = calculateDisplayTextLength(tempHistory);

          if (newTextLength >= MAX_CHAR_LIMITS[currentVersion] &&
            currentInputChar &&
            currentInputChar !== 'ED' &&
            currentInputChar !== 'かな' &&
            currentInputChar !== 'カナ') {
            const confirmPos = getConfirmButtonPosition(currentVersion);
            newPosition.x = confirmPos.x;
            newPosition.y = confirmPos.y;
          }
        } else if (action === 'B') {
          currentInputChar = "DELETE";
        } else if (action === '↑' || action === '↓' || action === '←' || action === '→') {
          const grid = createGrid(currentVersion, newIsHiragana);
          const nextPos = calculateNextPosition(newPosition, action, grid, inputCharCount);
          newPosition.x = nextPos.x;
          newPosition.y = nextPos.y;
        }

        setCurrentAction(action);

        setStateHistory(prev => [...prev, {
          position: { ...newPosition },
          isHiragana: newIsHiragana,
          charIndex,
          action,
          inputChar: currentInputChar
        }]);

        break;
      }

      stepCount += sequence.actions.length;
    }

    setCurrentStep(prev => prev + 1);
    setCurrentCharIndex(charIndex);
    setCurrentPosition(newPosition);
    setIsHiragana(newIsHiragana);
  }, [currentStep, totalSteps, currentPosition, isHiragana, sequences, currentVersion, stateHistory]);

  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      handleStepForward();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, handleStepForward]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sequences.length > 0) {
      setStateHistory([{
        position: { x: 0, y: 0 },
        isHiragana: false,
        charIndex: 0,
        action: null,
        inputChar: null
      }]);
    }
  }, [sequences]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = normalizeSpaces(e.target.value);
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
      setStateHistory([{
        position: { x: 0, y: 0 },
        isHiragana: false,
        charIndex: 0,
        action: null,
        inputChar: null
      }]);
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
          stateHistory={stateHistory}
        />
      </div>
    </div>
  );
}

export default App;
