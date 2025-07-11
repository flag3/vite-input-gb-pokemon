export type GameVersion = "GEN1" | "GEN2_NICKNAME" | "GEN2_BOX" | "GEN2_MAIL";
export type InputAction = "A" | "B" | "s" | "S" | "→" | "←" | "↑" | "↓";

export interface Position {
  x: number;
  y: number;
}

export interface CharacterPosition extends Position {
  char: string;
}

export interface CharacterGrid {
  version: GameVersion;
  isHiragana: boolean;
  width: number;
  height: number;
  grid: CharacterPosition[];
}

export interface StateHistory {
  position: Position;
  isHiragana: boolean;
  charIndex: number;
  action: InputAction | null;
  inputChar: string | null;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  currentCharIndex: number;
  currentAction: InputAction | null;
  playbackSpeed: number;
  stateHistory: StateHistory[];
  currentPosition: Position;
  isHiragana: boolean;
  totalSteps: number;
}

export interface InputProcessingState {
  inputText: string;
  currentVersion: GameVersion;
  sequences: InputPath[];
}

export type InputPath = {
  char: string;
  actions: InputAction[];
  totalSteps: number;
};
