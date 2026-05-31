import { RefObject } from "react";
import { getTextEditorColor } from "../../features/board/text";
import { Point, TextShape } from "../../features/board/types";

interface TextEditorProps {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  shape: TextShape;
  viewportOffset: Point;
  zoom: number;
  onChange: (content: string) => void;
  onExit: () => void;
}

export const TextEditor = ({
  editorRef,
  shape,
  viewportOffset,
  zoom,
  onChange,
  onExit,
}: TextEditorProps) => {
  const color = getTextEditorColor(shape.fill);

  return (
    <textarea
      ref={editorRef}
      aria-label="Text content"
      className="pointer-events-auto absolute resize-none overflow-hidden rounded-md border border-blue-500 bg-white/90 p-1 text-zinc-900 outline-none shadow-sm placeholder:text-zinc-500"
      value={shape.content}
      placeholder="Text"
      style={{
        left: viewportOffset.x + shape.x * zoom,
        top: viewportOffset.y + shape.y * zoom,
        width: shape.width * zoom,
        height: shape.height * zoom,
        minWidth: 80,
        minHeight: 32,
        fontSize: shape.fontSize * zoom,
        lineHeight: `${Math.round(shape.fontSize * 1.25 * zoom)}px`,
        color,
        caretColor: color,
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();

        if (event.key === "Escape") {
          onExit();
        }
      }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
