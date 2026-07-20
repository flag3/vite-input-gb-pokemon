import type { GameVersion } from "../types";
import { Icon } from "@iconify/react";
import { FormControl, IconButton, Select, Text, TextInput } from "@primer/react";
import { type ChangeEvent } from "react";

interface InputControlsProps {
  inputText: string;
  currentVersion: GameVersion;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  onTextChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVersionChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PlayIcon = () => <Icon icon="material-symbols:play-arrow" width={24} />;
const PauseIcon = () => <Icon icon="material-symbols:pause" width={24} />;
const ResetIcon = () => <Icon icon="material-symbols:restart-alt" width={24} />;
const BackIcon = () => <Icon icon="material-symbols:arrow-back" width={24} />;
const ForwardIcon = () => <Icon icon="material-symbols:arrow-forward" width={24} />;

export const InputControls = ({
  inputText,
  currentVersion,
  isPlaying,
  currentStep,
  totalSteps,
  playbackSpeed,
  onTextChange,
  onVersionChange,
  onPlayPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
}: InputControlsProps) => {
  const getTextField = () => {
    switch (currentVersion) {
      case "GEN1":
      case "GEN2_NICKNAME":
        return { label: "Nickname", placeholder: "Enter nickname" };
      case "GEN2_BOX":
        return { label: "Box name", placeholder: "Enter box name" };
      case "GEN2_MAIL":
        return { label: "Mail", placeholder: "Enter mail" };
      default:
        return { label: "Input text", placeholder: "Enter text" };
    }
  };

  const textField = getTextField();

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

      <div style={{ marginBottom: "20px", width: "100%" }}>
        <FormControl>
          <FormControl.Label>{textField.label}</FormControl.Label>
          <TextInput
            block
            size="large"
            value={inputText}
            onChange={onTextChange}
            placeholder={textField.placeholder}
          />
        </FormControl>
      </div>

      <div className="playback-row">
        <div className="playback-buttons">
          <IconButton
            icon={isPlaying ? PauseIcon : PlayIcon}
            aria-label={
              isPlaying ? "Pause" : currentStep >= totalSteps ? "Play from start" : "Play"
            }
            variant="invisible"
            onClick={onPlayPause}
          />

          <IconButton icon={ResetIcon} aria-label="Reset" variant="invisible" onClick={onReset} />

          <IconButton
            icon={BackIcon}
            aria-label="Previous"
            variant="invisible"
            disabled={currentStep === 0}
            onClick={onStepBackward}
          />

          <IconButton
            icon={ForwardIcon}
            aria-label="Next"
            variant="invisible"
            disabled={currentStep >= totalSteps}
            onClick={onStepForward}
          />
        </div>

        <div className="speed-control">
          <Icon
            icon="material-symbols:speed-outline"
            width={24}
            style={{ color: "var(--fgColor-accent)", flexShrink: 0 }}
          />
          <input
            type="range"
            aria-label="Playback speed"
            value={1000 - playbackSpeed}
            onChange={onSpeedChange}
            min={0}
            max={900}
            style={{ flex: 1 }}
          />
          <Text style={{ fontSize: "12px", color: "var(--fgColor-muted)", flexShrink: 0 }}>
            {(playbackSpeed / 1000).toFixed(2)}s
          </Text>
        </div>

        <div className="step-counter" style={{ color: "var(--fgColor-muted)" }}>
          Step: {currentStep} / {totalSteps}
        </div>
      </div>
    </>
  );
};
