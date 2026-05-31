"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type Tool =
  | "select"
  | "hand"
  | "rect"
  | "circle"
  | "line"
  | "text"
  | "sticky";

export type ShapeColor =
  | "transparent"
  | "#38bdf8"
  | "#a78bfa"
  | "#f97316"
  | "#22c55e"
  | "#ef4444"
  | "#facc15"
  | "#111827";

interface ToolbarContextType {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  selectedColor: ShapeColor;
  setSelectedColor: (color: ShapeColor) => void;
}

const ToolbarContext = createContext<
  ToolbarContextType | undefined
>(undefined);

export const ToolbarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedTool, setSelectedTool] =
    useState<Tool>("select");
  const [selectedColor, setSelectedColorState] =
    useState<ShapeColor>("transparent");

  const setSelectedColor = (color: ShapeColor) => {
    setSelectedColorState(color);
  };

  return (
    <ToolbarContext.Provider
      value={{
        selectedTool,
        setSelectedTool,
        selectedColor,
        setSelectedColor,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

export const useToolbar = () => {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error(
      "useToolbar must be used inside ToolbarProvider"
    );
  }

  return context;
};
