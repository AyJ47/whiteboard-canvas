import {
  getVisibleTextColor,
  handleSize,
  roundedRectangleRadius,
} from "./constants";
import { getHandlePoints, getBoxFromPoints } from "./geometry";
import { getFittedTextFontSize, wrapText } from "./text";
import { BoardShape, BoardSize, Box, Point, SelectionBox } from "./types";

const drawRoundedRectPath = (
  context: CanvasRenderingContext2D,
  box: Box,
  radius: number
) => {
  const clampedRadius = Math.min(radius, box.width / 2, box.height / 2);

  context.beginPath();
  context.moveTo(box.x + clampedRadius, box.y);
  context.lineTo(box.x + box.width - clampedRadius, box.y);
  context.quadraticCurveTo(
    box.x + box.width,
    box.y,
    box.x + box.width,
    box.y + clampedRadius
  );
  context.lineTo(box.x + box.width, box.y + box.height - clampedRadius);
  context.quadraticCurveTo(
    box.x + box.width,
    box.y + box.height,
    box.x + box.width - clampedRadius,
    box.y + box.height
  );
  context.lineTo(box.x + clampedRadius, box.y + box.height);
  context.quadraticCurveTo(
    box.x,
    box.y + box.height,
    box.x,
    box.y + box.height - clampedRadius
  );
  context.lineTo(box.x, box.y + clampedRadius);
  context.quadraticCurveTo(box.x, box.y, box.x + clampedRadius, box.y);
  context.closePath();
};

export const drawShape = (
  context: CanvasRenderingContext2D,
  shape: BoardShape,
  dashed: boolean,
  isDark: boolean
) => {
  context.save();
  context.fillStyle = shape.fill;
  context.strokeStyle = dashed ? (isDark ? "#f4f4f5" : "#111827") : (isDark ? "#d4d4d8" : "#0f172a");
  context.lineWidth = dashed ? 2 : 1;
  context.setLineDash(dashed ? [8, 6] : []);

  if (shape.type === "text") {
    const fontSize = getFittedTextFontSize(context, shape);

    context.font = `${fontSize}px sans-serif`;
    context.textBaseline = "top";
    context.fillStyle = getVisibleTextColor(shape.fill, isDark);

    const lineHeight = fontSize * 1.25;
    const lines = wrapText(context, shape.content, shape.width);

    lines.forEach((line, index) => {
      const y = shape.y + index * lineHeight;

      if (y + lineHeight <= shape.y + shape.height + lineHeight) {
        context.fillText(line, shape.x, y);
      }
    });

    context.restore();
    return;
  }

  if (shape.type === "circle") {
    context.beginPath();
    context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    if (shape.fill !== "transparent") {
      context.fill();
    }
    context.stroke();
    context.restore();
    return;
  }

  if (shape.type === "line") {
    context.beginPath();
    context.moveTo(shape.x, shape.y);
    context.lineTo(shape.endX, shape.endY);
    context.strokeStyle = shape.fill === "transparent" ? (isDark ? "#d4d4d8" : "#0f172a") : shape.fill;
    context.lineWidth = dashed ? 2 : 3;
    context.stroke();
    context.restore();
    return;
  }

  drawRoundedRectPath(context, shape, roundedRectangleRadius);
  if (shape.fill !== "transparent") {
    context.fill();
  }
  context.stroke();
  context.restore();
};

export const drawSelectionBox = (context: CanvasRenderingContext2D, box: Box, isDark: boolean) => {
  context.save();
  context.strokeStyle = isDark ? "#60a5fa" : "#2563eb";
  context.lineWidth = 1;
  context.setLineDash([6, 4]);
  context.strokeRect(box.x, box.y, box.width, box.height);
  context.fillStyle = isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(59, 130, 246, 0.08)";
  context.fillRect(box.x, box.y, box.width, box.height);
  context.restore();
};

export const drawTransformer = (
  context: CanvasRenderingContext2D,
  box: Box,
  zoom: number,
  isDark: boolean
) => {
  context.save();
  context.strokeStyle = isDark ? "#60a5fa" : "#2563eb";
  context.lineWidth = 1 / zoom;
  context.setLineDash([]);
  context.strokeRect(box.x, box.y, box.width, box.height);

  const handles = getHandlePoints(box);
  const scaledHandleSize = handleSize / zoom;
  context.fillStyle = isDark ? "#18181b" : "#ffffff";
  context.strokeStyle = isDark ? "#60a5fa" : "#2563eb";

  Object.values(handles).forEach((point) => {
    context.beginPath();
    context.rect(
      point.x - scaledHandleSize / 2,
      point.y - scaledHandleSize / 2,
      scaledHandleSize,
      scaledHandleSize
    );
    context.fill();
    context.stroke();
  });

  context.restore();
};

export const drawGrid = (
  context: CanvasRenderingContext2D,
  boardSize: BoardSize,
  viewportOffset: Point,
  zoom: number,
  isDark: boolean
) => {
  const gridSize = 40;
  const minWorldX = -viewportOffset.x / zoom;
  const minWorldY = -viewportOffset.y / zoom;
  const maxWorldX = (boardSize.width - viewportOffset.x) / zoom;
  const maxWorldY = (boardSize.height - viewportOffset.y) / zoom;
  const startWorldX = Math.floor(minWorldX / gridSize) * gridSize;
  const startWorldY = Math.floor(minWorldY / gridSize) * gridSize;

  context.save();
  context.strokeStyle = isDark ? "#27272a" : "#f1f5f9";
  context.lineWidth = 1;

  for (let worldX = startWorldX; worldX <= maxWorldX; worldX += gridSize) {
    const x = viewportOffset.x + worldX * zoom;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, boardSize.height);
    context.stroke();
  }

  for (let worldY = startWorldY; worldY <= maxWorldY; worldY += gridSize) {
    const y = viewportOffset.y + worldY * zoom;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(boardSize.width, y);
    context.stroke();
  }

  context.restore();
};

export const drawSelection = (
  context: CanvasRenderingContext2D,
  selectionBox: SelectionBox | null,
  isDark: boolean
) => {
  if (selectionBox?.visible) {
    drawSelectionBox(context, getBoxFromPoints(selectionBox.start, selectionBox.end), isDark);
  }
};
