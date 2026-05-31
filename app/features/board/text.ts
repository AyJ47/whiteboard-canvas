import { getVisibleTextColor, minTextFontSize } from "./constants";
import { TextShape } from "./types";

export const wrapText = (
  context: CanvasRenderingContext2D,
  content: string,
  maxWidth: number
) => {
  const lines: string[] = [];

  content.split("\n").forEach((paragraph) => {
    const words = paragraph.split(" ");
    let line = "";

    words.forEach((word) => {
      if (context.measureText(word).width > maxWidth) {
        if (line) {
          lines.push(line);
          line = "";
        }

        let segment = "";

        word.split("").forEach((character) => {
          const nextSegment = `${segment}${character}`;

          if (context.measureText(nextSegment).width <= maxWidth || !segment) {
            segment = nextSegment;
            return;
          }

          lines.push(segment);
          segment = character;
        });

        line = segment;
        return;
      }

      const nextLine = line ? `${line} ${word}` : word;

      if (context.measureText(nextLine).width <= maxWidth || !line) {
        line = nextLine;
        return;
      }

      lines.push(line);
      line = word;
    });

    lines.push(line);
  });

  return lines;
};

export const getFittedTextFontSize = (
  context: CanvasRenderingContext2D,
  shape: TextShape,
  content = shape.content
) => {
  if (!content) {
    return shape.fontSize;
  }

  for (let fontSize = shape.fontSize; fontSize >= minTextFontSize; fontSize -= 1) {
    context.font = `${fontSize}px sans-serif`;

    const lineHeight = fontSize * 1.25;
    const lines = wrapText(context, content, shape.width);

    if (lines.length * lineHeight <= shape.height) {
      return fontSize;
    }
  }

  return minTextFontSize;
};

export const getTextEditorColor = (fill: string) => getVisibleTextColor(fill);
