import { ShapeColor, Tool } from "../../contexts/toolbar-context";
import {
  defaultStickyNoteFontSize,
  defaultTextFontSize,
  getVisibleTextColor,
  stickyNoteColors,
  stickyNoteHeight,
  stickyNoteWidth,
  textBoxHeight,
  textBoxWidth,
} from "./constants";
import { getBoxFromPoints } from "./geometry";
import {
  BoardShape,
  CircleShape,
  DrawingToolMap,
  Point,
  RectangleShape,
  StickyNote,
  TextShape,
  LineShape,
} from "./types";

export const createRectangle = (
  id: string,
  start: Point,
  end: Point,
  fill: ShapeColor
): RectangleShape => ({
  id,
  type: "rect",
  ...getBoxFromPoints(start, end),
  fill,
});

export const createCircle = (
  id: string,
  start: Point,
  end: Point,
  fill: ShapeColor
): CircleShape => ({
  id,
  type: "circle",
  x: start.x,
  y: start.y,
  radius: Math.hypot(end.x - start.x, end.y - start.y),
  fill,
});

export const createTextShape = (point: Point, fill: ShapeColor): TextShape => ({
  id: `text-${crypto.randomUUID()}`,
  type: "text",
  x: point.x,
  y: point.y,
  width: textBoxWidth,
  height: textBoxHeight,
  content: "",
  fill: getVisibleTextColor(fill),
  fontSize: defaultTextFontSize,
});

export const createStickyNote = (point: Point): StickyNote => ({
  id: `sticky-${crypto.randomUUID()}`,
  x: point.x,
  y: point.y,
  width: stickyNoteWidth,
  height: stickyNoteHeight,
  color: stickyNoteColors[0],
  content: "",
  fontSize: defaultStickyNoteFontSize,
});

export const createLine = (
  id: string,
  start: Point,
  end: Point,
  fill: ShapeColor
): LineShape => ({
  id,
  type: "line",
  x: start.x,
  y: start.y,
  endX: end.x,
  endY: end.y,
  fill,
});

export const drawingTools: DrawingToolMap = {
  rect: createRectangle,
  circle: createCircle,
  line: createLine,
} satisfies Partial<Record<Tool, (id: string, start: Point, end: Point, fill: ShapeColor) => BoardShape>>;
