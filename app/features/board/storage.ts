import { boardStorageKey } from "./constants";
import { clampZoom } from "./geometry";
import { BoardShape, Point, StickyNote, StoredBoardState } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPoint = (value: unknown): value is Point =>
  isRecord(value) && isNumber(value.x) && isNumber(value.y);

const isBoardShape = (value: unknown): value is BoardShape => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.fill !== "string") {
    return false;
  }

  if (value.type === "rect") {
    return (
      isNumber(value.x) &&
      isNumber(value.y) &&
      isNumber(value.width) &&
      isNumber(value.height)
    );
  }

  if (value.type === "circle") {
    return isNumber(value.x) && isNumber(value.y) && isNumber(value.radius);
  }

  if (value.type === "text") {
    return (
      isNumber(value.x) &&
      isNumber(value.y) &&
      isNumber(value.width) &&
      isNumber(value.height) &&
      typeof value.content === "string" &&
      isNumber(value.fontSize)
    );
  }

  return false;
};

const isStickyNote = (value: unknown): value is StickyNote =>
  isRecord(value) &&
  typeof value.id === "string" &&
  isNumber(value.x) &&
  isNumber(value.y) &&
  isNumber(value.width) &&
  isNumber(value.height) &&
  typeof value.color === "string" &&
  typeof value.content === "string" &&
  isNumber(value.fontSize);

const isStoredBoardState = (value: unknown): value is StoredBoardState =>
  isRecord(value) &&
  value.version === 1 &&
  Array.isArray(value.shapes) &&
  value.shapes.every(isBoardShape) &&
  Array.isArray(value.stickyNotes) &&
  value.stickyNotes.every(isStickyNote) &&
  isPoint(value.viewportOffset) &&
  isNumber(value.zoom);

export const loadStoredBoardState = (): StoredBoardState | null => {
  try {
    const storedState = window.localStorage.getItem(boardStorageKey);

    if (!storedState) {
      return null;
    }

    const parsedState: unknown = JSON.parse(storedState);

    if (!isStoredBoardState(parsedState)) {
      return null;
    }

    return {
      ...parsedState,
      zoom: clampZoom(parsedState.zoom),
    };
  } catch {
    return null;
  }
};

export const saveStoredBoardState = (state: StoredBoardState) => {
  try {
    window.localStorage.setItem(boardStorageKey, JSON.stringify(state));
  } catch {
    // Storage can be unavailable or full. Keep the in-memory board usable.
  }
};
