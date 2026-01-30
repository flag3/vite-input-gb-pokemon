import { UI_CONSTANTS } from "../constants/ui";
import type { GameVersion } from "../types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SpeedIcon from "@mui/icons-material/Speed";
import { IconButton, Slider, Tooltip } from "@mui/material";
import { type ChangeEvent, type FC } from "react";

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
  onSpeedChange: (_: Event, value: number | number[]) => void;
}

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
          <Tooltip
            title={isPlaying ? "Pause" : currentStep >= totalSteps ? "Play from start" : "Play"}
          >
            <IconButton onClick={onPlayPause} color="primary" size="large">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset">
            <IconButton onClick={onReset} color="primary" size="large">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Previous">
            <span>
              <IconButton
                onClick={onStepBackward}
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
                onClick={onStepForward}
                disabled={currentStep >= totalSteps}
                color="primary"
                size="large"
              >
                <ArrowForwardIcon />
              </IconButton>
            </span>
          </Tooltip>
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
          <Tooltip title="Playback Speed">
            <SpeedIcon color="primary" />
          </Tooltip>
          <Slider
            value={1000 - playbackSpeed}
            onChange={onSpeedChange}
            min={0}
            max={900}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${((1000 - value) / 1000).toFixed(2)}s`}
          />
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
