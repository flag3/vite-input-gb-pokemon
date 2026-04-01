import { UI_CONSTANTS } from "../constants/ui";
import type { GameVersion } from "../types";
import { Icon } from "@iconify/react";
import React, { type ChangeEvent, type FC } from "react";

interface InputControlsProps {
  inputText: string;
  currentVersion: GameVersion;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  isMobile: boolean;
  onTextChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVersionChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const iconButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  border: "none",
  borderRadius: "50%",
  background: "none",
  color: "#1976d2",
  cursor: "pointer",
};

export const InputControls: FC<InputControlsProps> = ({
  inputText,
  currentVersion,
  isPlaying,
  currentStep,
  totalSteps,
  playbackSpeed,
  isMobile,
  onTextChange,
  onVersionChange,
  onPlayPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
}) => {
  const getPlaceholder = () => {
    switch (currentVersion) {
      case "GEN1":
      case "GEN2_NICKNAME":
        return "Enter nickname";
      case "GEN2_BOX":
        return "Enter box name";
      case "GEN2_MAIL":
        return "Enter mail";
      default:
        return "Enter text";
    }
  };

  return (
    <>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
        }}
      >
        <select
          id="version-select"
          aria-label="Game version"
          value={currentVersion}
          onChange={onVersionChange}
          style={{
            padding: "8px",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <option value="GEN1">gen-1 nickname</option>
          <option value="GEN2_NICKNAME">gen-2 nickname</option>
          <option value="GEN2_BOX">gen-2 box</option>
          <option value="GEN2_MAIL">gen-2 mail</option>
        </select>
      </div>

      <div
        style={{
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={onTextChange}
          placeholder={getPlaceholder()}
          style={{
            width: "100%",
            padding: `${UI_CONSTANTS.GRID.PADDING}px`,
            fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_INPUT}px`,
            borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <button
            title={isPlaying ? "Pause" : currentStep >= totalSteps ? "Play from start" : "Play"}
            onClick={onPlayPause}
            style={iconButtonStyle}
          >
            {isPlaying ? (
              <Icon icon="material-symbols:pause" width={24} />
            ) : (
              <Icon icon="material-symbols:play-arrow" width={24} />
            )}
          </button>

          <button title="Reset" onClick={onReset} style={iconButtonStyle}>
            <Icon icon="material-symbols:restart-alt" width={24} />
          </button>

          <button
            title="Previous"
            onClick={onStepBackward}
            disabled={currentStep === 0}
            style={iconButtonStyle}
          >
            <Icon icon="material-symbols:arrow-back" width={24} />
          </button>

          <button
            title="Next"
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            style={iconButtonStyle}
          >
            <Icon icon="material-symbols:arrow-forward" width={24} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
            minWidth: isMobile ? "100%" : "200px",
          }}
        >
          <Icon
            icon="material-symbols:speed-outline"
            width={24}
            style={{ color: "#1976d2", flexShrink: 0 }}
          />
          <input
            type="range"
            value={1000 - playbackSpeed}
            onChange={onSpeedChange}
            min={0}
            max={900}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: "12px", color: UI_CONSTANTS.COLORS.TEXT_MUTED, flexShrink: 0 }}>
            {(playbackSpeed / 1000).toFixed(2)}s
          </span>
        </div>

        <div
          style={{
            color: UI_CONSTANTS.COLORS.TEXT_MUTED,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Step: {currentStep} / {totalSteps}
        </div>
      </div>
    </>
  );
};
