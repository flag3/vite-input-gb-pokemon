import { type FC, type ReactNode } from "react";

interface SimulatorLayoutProps {
  children: ReactNode;
}

export const SimulatorLayout: FC<SimulatorLayoutProps> = ({ children }) => {
  return <div className="simulator-layout">{children}</div>;
};
