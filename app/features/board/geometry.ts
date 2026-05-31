import {
  handleHitSize,
  maxTextFontSize,
  maxZoom,
  minShapeSize,
  minTextFontSize,
  minZoom,
} from "./constants";
import { BoardShape, BoardSize, Box, Point, ResizeHandle } from "./types";

export const getWindowSize = (): BoardSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const getShapeBox = (shape: BoardShape): Box => {
  if (shape.type === "circle") {
    return {
      x: shape.x - shape.radius,
      y: shape.y - shape.radius,
      width: shape.radius * 2,
      height: shape.radius * 2,
    };
  }

  if (shape.type === "line") {
    return {
      x: Math.min(shape.x, shape.endX),
      y: Math.min(shape.y, shape.endY),
      width: Math.abs(shape.endX - shape.x),
      height: Math.abs(shape.endY - shape.y),
    };
  }

  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };
};

export const getBoxFromPoints = (start: Point, end: Point): Box => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

export const boxesIntersect = (first: Box, second: Box) =>
  first.x <= second.x + second.width &&
  first.x + first.width >= second.x &&
  first.y <= second.y + second.height &&
  first.y + first.height >= second.y;

export const getShapesBox = (shapes: BoardShape[]): Box | null => {
  if (!shapes.length) {
    return null;
  }

  const boxes = shapes.map(getShapeBox);
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const pointInShape = (point: Point, shape: BoardShape) => {
  if (shape.type === "circle") {
    return Math.hypot(point.x - shape.x, point.y - shape.y) <= shape.radius;
  }

  if (shape.type === "line") {
    const padding = 10;
    const l2 = Math.pow(shape.endX - shape.x, 2) + Math.pow(shape.endY - shape.y, 2);
    if (l2 === 0) return Math.hypot(point.x - shape.x, point.y - shape.y) <= padding;
    let t = ((point.x - shape.x) * (shape.endX - shape.x) + (point.y - shape.y) * (shape.endY - shape.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const dist = Math.hypot(point.x - (shape.x + t * (shape.endX - shape.x)), point.y - (shape.y + t * (shape.endY - shape.y)));
    return dist <= padding;
  }

  return (
    point.x >= shape.x &&
    point.x <= shape.x + shape.width &&
    point.y >= shape.y &&
    point.y <= shape.y + shape.height
  );
};

export const getHandlePoints = (box: Box): Record<ResizeHandle, Point> => ({
  nw: { x: box.x, y: box.y },
  n: { x: box.x + box.width / 2, y: box.y },
  ne: { x: box.x + box.width, y: box.y },
  e: { x: box.x + box.width, y: box.y + box.height / 2 },
  se: { x: box.x + box.width, y: box.y + box.height },
  s: { x: box.x + box.width / 2, y: box.y + box.height },
  sw: { x: box.x, y: box.y + box.height },
  w: { x: box.x, y: box.y + box.height / 2 },
});

export const getResizeHandleAtPoint = (
  point: Point,
  box: Box,
  zoom: number
): ResizeHandle | null => {
  const handles = getHandlePoints(box);
  const hitSize = handleHitSize / zoom;

  for (const [handle, handlePoint] of Object.entries(handles)) {
    if (
      Math.abs(point.x - handlePoint.x) <= hitSize / 2 &&
      Math.abs(point.y - handlePoint.y) <= hitSize / 2
    ) {
      return handle as ResizeHandle;
    }
  }

  return null;
};

export const getResizedBox = (
  handle: ResizeHandle,
  startBox: Box,
  point: Point
): Box => {
  let left = startBox.x;
  let top = startBox.y;
  let right = startBox.x + startBox.width;
  let bottom = startBox.y + startBox.height;

  if (handle.includes("w")) {
    left = Math.min(point.x, right - minShapeSize);
  }

  if (handle.includes("e")) {
    right = Math.max(point.x, left + minShapeSize);
  }

  if (handle.includes("n")) {
    top = Math.min(point.y, bottom - minShapeSize);
  }

  if (handle.includes("s")) {
    bottom = Math.max(point.y, top + minShapeSize);
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const resizeShapeFromBox = (
  shape: BoardShape,
  startBox: Box,
  nextBox: Box
): BoardShape => {
  const scaleX = nextBox.width / startBox.width;
  const scaleY = nextBox.height / startBox.height;

  if (shape.type === "circle") {
    const shapeBox = getShapeBox(shape);
    const centerOffsetX = shape.x - startBox.x;
    const centerOffsetY = shape.y - startBox.y;
    const scale = scaleX < 1 || scaleY < 1 ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

    return {
      ...shape,
      x: nextBox.x + centerOffsetX * scaleX,
      y: nextBox.y + centerOffsetY * scaleY,
      radius: Math.max(minShapeSize / 2, (shapeBox.width / 2) * scale),
    };
  }

  if (shape.type === "text") {
    const textScale = Math.max(0.25, (scaleX + scaleY) / 2);

    return {
      ...shape,
      x: nextBox.x + (shape.x - startBox.x) * scaleX,
      y: nextBox.y + (shape.y - startBox.y) * scaleY,
      width: Math.max(minShapeSize, shape.width * scaleX),
      height: Math.max(minShapeSize, shape.height * scaleY),
      fontSize: Math.min(
        maxTextFontSize,
        Math.max(minTextFontSize, shape.fontSize * textScale)
      ),
    };
  }

  if (shape.type === "line") {
    return {
      ...shape,
      x: nextBox.x + (shape.x - startBox.x) * scaleX,
      y: nextBox.y + (shape.y - startBox.y) * scaleY,
      endX: nextBox.x + (shape.endX - startBox.x) * scaleX,
      endY: nextBox.y + (shape.endY - startBox.y) * scaleY,
    };
  }

  return {
    ...shape,
    x: nextBox.x + (shape.x - startBox.x) * scaleX,
    y: nextBox.y + (shape.y - startBox.y) * scaleY,
    width: Math.max(minShapeSize, shape.width * scaleX),
    height: Math.max(minShapeSize, shape.height * scaleY),
  };
};

export const getCanvasPoint = (
  event: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export const clampZoom = (zoom: number) => Math.min(maxZoom, Math.max(minZoom, zoom));

export const screenToWorld = (
  point: Point,
  viewportOffset: Point,
  zoom: number
): Point => ({
  x: (point.x - viewportOffset.x) / zoom,
  y: (point.y - viewportOffset.y) / zoom,
});
