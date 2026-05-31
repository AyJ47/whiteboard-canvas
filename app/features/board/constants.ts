import { BoardShape, StickyNote } from "./types";

export const initialShapes: BoardShape[] = [];
export const initialStickyNotes: StickyNote[] = [];

export const boardStorageKey = "whiteboard-interactive:board-state";
export const minShapeSize = 5;
export const roundedRectangleRadius = 14;
export const textBoxWidth = 220;
export const textBoxHeight = 48;
export const defaultTextFontSize = 24;
export const minTextFontSize = 8;
export const maxTextFontSize = 120;
export const stickyNoteWidth = 200;
export const stickyNoteHeight = 150;
export const minStickyNoteWidth = 160;
export const minStickyNoteHeight = 120;
export const handleSize = 9;
export const handleHitSize = 14;
export const minZoom = 0.25;
export const maxZoom = 4;
export const keyboardZoomStep = 1.2;
export const defaultStickyNoteFontSize = 14;
export const minStickyNoteFontSize = 10;
export const maxStickyNoteFontSize = 28;
export const stickyNoteFontStep = 2;
export const stickyNoteColors = ["#fef08a", "#fed7aa", "#bfdbfe", "#bbf7d0", "#fbcfe8"];
export const defaultTextColor = "#111827";

export const getVisibleTextColor = (fill: string) =>
  fill === "transparent" ? defaultTextColor : fill;

export const getStickyNoteFontSize = (note: StickyNote) =>
  note.fontSize ?? defaultStickyNoteFontSize;
