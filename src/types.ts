export type GameVersion = 'GEN1' | 'GEN2_NICKNAME' | 'GEN2_BOX' | 'GEN2_MAIL';
export type InputAction = 'A' | 'B' | 's' | 'S' | '→' | '←' | '↑' | '↓';
export type KeyboardAction = 'Enter' | 'Backspace' | 'ArrowRight' | 'ArrowLeft' | 'ArrowUp' | 'ArrowDown';

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

export type InputPath = {
  char: string;
  actions: InputAction[];
  totalSteps: number;
}; 
