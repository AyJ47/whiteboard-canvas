import { X } from "lucide-react";
import type { PointerEvent } from "react";
import {
  getStickyNoteFontSize,
  maxStickyNoteFontSize,
  minStickyNoteFontSize,
  minStickyNoteHeight,
  minStickyNoteWidth,
  stickyNoteColors,
  stickyNoteFontStep,
} from "../../features/board/constants";
import { Point, StickyNote } from "../../features/board/types";

interface StickyNotesLayerProps {
  notes: StickyNote[];
  selectedNoteId: string | null;
  viewportOffset: Point;
  zoom: number;
  onColorChange: (noteId: string, color: string) => void;
  onContentChange: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
  onFontSizeChange: (noteId: string, delta: number) => void;
  onFocusNote: (noteId: string) => void;
  onDragStart: (event: PointerEvent<HTMLDivElement>, note: StickyNote) => void;
  onDragMove: (event: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLDivElement>, note: StickyNote) => void;
  onResizeMove: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeEnd: (event: PointerEvent<HTMLDivElement>) => void;
}

export const StickyNotesLayer = ({
  notes,
  selectedNoteId,
  viewportOffset,
  zoom,
  onColorChange,
  onContentChange,
  onDelete,
  onFontSizeChange,
  onFocusNote,
  onDragStart,
  onDragMove,
  onDragEnd,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: StickyNotesLayerProps) => (
  <>
    {notes.map((note) => {
      const selected = note.id === selectedNoteId;
      const fontSize = getStickyNoteFontSize(note);

      return (
        <div
          key={note.id}
          className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-[0_8px_18px_rgba(15,23,42,0.16)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.5)] ${
            selected ? "ring-2 ring-blue-500" : ""
          }`}
          style={{
            left: viewportOffset.x + note.x * zoom,
            top: viewportOffset.y + note.y * zoom,
            width: note.width,
            height: note.height,
            minWidth: minStickyNoteWidth,
            minHeight: minStickyNoteHeight,
            backgroundColor: note.color,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            onFocusNote(note.id);
          }}
        >
          <div
            className="flex h-8 cursor-move touch-none items-center justify-between gap-2 border-b border-black/10 dark:border-black/20 px-2"
            onPointerDown={(event) => onDragStart(event, note)}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <div className="h-1.5 w-8 rounded-full bg-black/15 dark:bg-black/25" />
            <button
              type="button"
              aria-label="Delete sticky note"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-black/10 text-zinc-700 transition-colors hover:bg-black/10 hover:text-zinc-950 dark:border-black/20 dark:text-zinc-800 dark:hover:bg-black/20 dark:hover:text-black"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onDelete(note.id)}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
          <textarea
            aria-label="Sticky note content"
            className="min-h-0 flex-1 resize-none bg-transparent p-3 text-zinc-900 outline-none placeholder:text-zinc-600/70 dark:text-zinc-900 dark:placeholder:text-zinc-700/70"
            placeholder="Write a note..."
            value={note.content}
            style={{
              fontSize,
              lineHeight: `${Math.round(fontSize * 1.35)}px`,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onFocus={() => onFocusNote(note.id)}
            onChange={(event) => onContentChange(note.id, event.target.value)}
          />
          {selected && (
            <>
              <div className="flex h-9 items-center justify-between gap-2 border-t border-black/10 dark:border-black/20 px-2">
                <div className="flex min-w-0 items-center gap-1">
                  {stickyNoteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label="Change sticky note color"
                      className={`h-5 w-5 shrink-0 rounded-full border transition-transform hover:scale-110 ${
                        note.color === color ? "border-zinc-900" : "border-black/20"
                      }`}
                      style={{ backgroundColor: color }}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => onColorChange(note.id, color)}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Decrease sticky note text size"
                    className="h-6 min-w-7 rounded-md border border-black/10 px-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-black/20 dark:text-zinc-800 dark:hover:bg-black/20"
                    disabled={fontSize <= minStickyNoteFontSize}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onFontSizeChange(note.id, -stickyNoteFontStep)}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    aria-label="Increase sticky note text size"
                    className="h-6 min-w-7 rounded-md border border-black/10 px-1 text-sm font-semibold text-zinc-700 transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-black/20 dark:text-zinc-800 dark:hover:bg-black/20"
                    disabled={fontSize >= maxStickyNoteFontSize}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onFontSizeChange(note.id, stickyNoteFontStep)}
                  >
                    A+
                  </button>
                </div>
              </div>
              <div
                aria-label="Resize sticky note"
                className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize touch-none rounded-full border border-blue-500 bg-white dark:bg-zinc-800 shadow-sm"
                role="button"
                onPointerDown={(event) => onResizeStart(event, note)}
                onPointerMove={onResizeMove}
                onPointerUp={onResizeEnd}
                onPointerCancel={onResizeEnd}
              />
            </>
          )}
        </div>
      );
    })}
  </>
);
