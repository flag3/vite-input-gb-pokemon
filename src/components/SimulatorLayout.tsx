import { UI_CONSTANTS } from "../constants/ui";
import { type FC, type ReactNode } from "react";

interface SimulatorLayoutProps {
  children: ReactNode;
  isMobile: boolean;
}

export const SimulatorLayout: FC<SimulatorLayoutProps> = ({
  children,
  isMobile,
}) => {
  return (
    <div
      style={{
        maxWidth: `${UI_CONSTANTS.LAYOUT.MAX_WIDTH}px`,
        margin: "0 auto",
        padding: `${UI_CONSTANTS.LAYOUT.CONTAINER_PADDING}px`,
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : `1fr ${UI_CONSTANTS.LAYOUT.SIDEBAR_WIDTH}px`,
        gap: `${UI_CONSTANTS.LAYOUT.SECTION_GAP}px`,
      }}
    >
      {children}
    </div>
  );
};
