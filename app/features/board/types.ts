import { ShapeColor, Tool } from "../../contexts/toolbar-context";

export interface RectangleShape {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface CircleShape {
  id: string;
  type: "circle";
  x: number;
  y: number;
  radius: number;
  fill: string;
}

export interface TextShape {
  id: string;
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fill: string;
  fontSize: number;
}

export type BoardShape = RectangleShape | CircleShape | TextShape;
export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content: string;
  fontSize: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionBox {
  visible: boolean;
  start: Point;
  end: Point;
}

export interface BoardSize {
  width: number;
  height: number;
}

export interface StoredBoardState {
  version: 1;
  shapes: BoardShape[];
  stickyNotes: StickyNote[];
  viewportOffset: Point;
  zoom: number;
}

export type DrawingFactory = (
  id: string,
  start: Point,
  end: Point,
  fill: ShapeColor
) => BoardShape;

export type Interaction =
  | { type: "idle" }
  | { type: "panning"; start: Point; startViewportOffset: Point }
  | {
      type: "drawing";
      start: Point;
      fill: ShapeColor;
      createShape: DrawingFactory;
    }
  | { type: "selecting"; start: Point }
  | {
      type: "dragging";
      start: Point;
      ids: string[];
      startShapes: BoardShape[];
    }
  | {
      type: "resizing";
      handle: ResizeHandle;
      startBox: Box;
      startShapes: BoardShape[];
    }
  | {
      type: "draggingNote";
      pointerId: number;
      start: Point;
      note: StickyNote;
    }
  | {
      type: "resizingNote";
      pointerId: number;
      start: Point;
      note: StickyNote;
    };

export type DrawingToolMap = Partial<Record<Tool, DrawingFactory>>;
