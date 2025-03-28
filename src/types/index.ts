export type InputAction = 'A' | 'B' | 's' | 'S' | '→' | '←' | '↑' | '↓';

export type CharacterPosition = {
  char: string;
  x: number;
  y: number;
};

export type GameVersion = 'GEN1' | 'GEN2_MAIL' | 'GEN2_BOX';

export type InputPath = {
  char: string;
  actions: InputAction[];
  totalSteps: number;
};

export type CharacterGrid = {
  version: GameVersion;
  grid: CharacterPosition[];
  width: number;
  height: number;
  isHiragana: boolean;
}; 
