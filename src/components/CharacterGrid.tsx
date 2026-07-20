import { GROUPABLE_CHARS } from "../constants/gameConstants";
import { UI_CONSTANTS } from "../constants/ui";
import type { CharacterGrid as CharacterGridType, InputAction } from "../types";

interface CharacterGridProps {
  grid: CharacterGridType;
  currentPosition: { x: number; y: number };
  currentAction: InputAction | null;
}

export const CharacterGrid = ({ grid, currentPosition, currentAction }: CharacterGridProps) => {
  const getGroupedCells = () => {
    const cells: {
      char: string;
      x: number[];
      y: number;
      width: number;
    }[] = [];

    grid.grid.forEach((char) => {
      if (GROUPABLE_CHARS.includes(char.char)) {
        const existingGroup = cells.find((cell) => cell.char === char.char && cell.y === char.y);

        if (existingGroup) {
          existingGroup.x.push(char.x);
          existingGroup.width++;
        } else {
          cells.push({
            char: char.char,
            x: [char.x],
            y: char.y,
            width: 1,
          });
        }
      } else {
        cells.push({
          char: char.char,
          x: [char.x],
          y: char.y,
          width: 1,
        });
      }
    });

    return cells;
  };

  const groupedCells = getGroupedCells();

  return (
    <div style={{ position: "relative" }}>
      <div
        className="grid-container"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.width}, ${UI_CONSTANTS.GRID.CELL_SIZE}px)`,
          gap: `${UI_CONSTANTS.GRID.GAP}px`,
          padding: `${UI_CONSTANTS.GRID.PADDING}px`,
          backgroundColor: "var(--bgColor-muted)",
          borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS * 2}px`,
        }}
      >
        {groupedCells.map((cell, index) => (
          <div
            key={index}
            style={{
              width: `${cell.width * UI_CONSTANTS.GRID.CELL_SIZE + (cell.width - 1) * UI_CONSTANTS.GRID.GAP}px`,
              height: `${UI_CONSTANTS.GRID.CELL_SIZE}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                cell.x.includes(currentPosition.x) && cell.y === currentPosition.y
                  ? "var(--bgColor-accent-emphasis)"
                  : "var(--bgColor-default)",
              color:
                cell.x.includes(currentPosition.x) && cell.y === currentPosition.y
                  ? "var(--fgColor-onEmphasis)"
                  : "var(--fgColor-default)",
              borderRadius: `${UI_CONSTANTS.GRID.BORDER_RADIUS}px`,
              cursor: "pointer",
              userSelect: "none",
              fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_INPUT}px`,
              position: "relative",
              transition: `background-color ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}`,
              gridColumn: `${cell.x[0] + 1} / span ${cell.width}`,
            }}
            className={`character-cell ${cell.x.includes(currentPosition.x) && cell.y === currentPosition.y ? "active" : ""}`}
          >
            {cell.char}
            {cell.x.includes(currentPosition.x) &&
              cell.y === currentPosition.y &&
              currentAction === "A" && (
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--bgColor-success-emphasis)",
                    color: "var(--fgColor-onEmphasis)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: `${UI_CONSTANTS.TYPOGRAPHY.FONT_SIZE_SMALL}px`,
                    animation: `fadeOut ${UI_CONSTANTS.ANIMATION.FADE_OUT_DURATION} forwards`,
                  }}
                >
                  A
                </div>
              )}
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, 0); }
            to { opacity: 0; transform: translate(-50%, -10px); }
          }
        `}
      </style>
    </div>
  );
};
