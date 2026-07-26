import type { GameVersion } from "../types";
import { Icon } from "@iconify/react";
import {
  ButtonGroup,
  FormControl,
  IconButton,
  SegmentedControl,
  Select,
  TextInput,
} from "@primer/react";
import { type ChangeEvent, type CompositionEvent } from "react";

interface InputControlsProps {
  inputText: string;
  currentVersion: GameVersion;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  onTextChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCompositionEnd: (e: CompositionEvent<HTMLInputElement>) => void;
  onVersionChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
}

const PLAYBACK_SPEEDS = [1, 2, 4];

const PlayIcon = () => <Icon icon="material-symbols:play-arrow" />;
const PauseIcon = () => <Icon icon="material-symbols:pause" />;
const ResetIcon = () => <Icon icon="material-symbols:restart-alt" />;
const BackIcon = () => <Icon icon="material-symbols:arrow-back" />;
const ForwardIcon = () => <Icon icon="material-symbols:arrow-forward" />;

export const InputControls = ({
  inputText,
  currentVersion,
  isPlaying,
  currentStep,
  totalSteps,
  playbackSpeed,
  onTextChange,
  onCompositionEnd,
  onVersionChange,
  onPlayPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
}: InputControlsProps) => {
  const getTextFieldLabel = () => {
    switch (currentVersion) {
      case "GEN1":
      case "GEN2_NICKNAME":
        return "Nickname";
      case "GEN2_BOX":
        return "Box name";
      case "GEN2_MAIL":
        return "Mail";
      default:
        return "Input text";
    }
  };

  return (
    <>
      <div className="controls-row">
        <FormControl>
          <FormControl.Label>Input mode</FormControl.Label>
          <Select block value={currentVersion} onChange={onVersionChange}>
            <Select.Option value="GEN1">gen-1 nickname</Select.Option>
            <Select.Option value="GEN2_NICKNAME">gen-2 nickname</Select.Option>
            <Select.Option value="GEN2_BOX">gen-2 box</Select.Option>
            <Select.Option value="GEN2_MAIL">gen-2 mail</Select.Option>
          </Select>
        </FormControl>
      </div>

      <div className="text-input-row">
        <FormControl>
          <FormControl.Label>{getTextFieldLabel()}</FormControl.Label>
          <TextInput
            className="text-input-mono"
            block
            size="large"
            value={inputText}
            onChange={onTextChange}
            onCompositionEnd={onCompositionEnd}
          />
        </FormControl>
      </div>

      <div className="playback-row">
        <div className="playback-buttons">
          <ButtonGroup>
            <IconButton
              icon={isPlaying ? PauseIcon : PlayIcon}
              aria-label={
                isPlaying ? "Pause" : currentStep >= totalSteps ? "Play from start" : "Play"
              }
              onClick={onPlayPause}
            />

            <IconButton
              icon={BackIcon}
              aria-label="Previous"
              disabled={currentStep === 0}
              onClick={onStepBackward}
            />

            <IconButton
              icon={ForwardIcon}
              aria-label="Next"
              disabled={currentStep >= totalSteps}
              onClick={onStepForward}
            />

            <IconButton icon={ResetIcon} aria-label="Reset" onClick={onReset} />
          </ButtonGroup>
        </div>

        <SegmentedControl
          aria-label="Playback speed"
          onChange={(index) => onSpeedChange(PLAYBACK_SPEEDS[index])}
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <SegmentedControl.Button key={speed} selected={speed === playbackSpeed}>
              {`${speed}×`}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl>

        <div className="step-counter">
          Step: {currentStep} / {totalSteps}
        </div>
      </div>
    </>
  );
};
