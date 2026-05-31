import { BringToFront, Minus, Plus, SendToBack, Trash2 } from "lucide-react";
import { maxZoom, minZoom } from "../../features/board/constants";

interface BoardControlsProps {
  canLayerSelection: boolean;
  zoom: number;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const BoardControls = ({
  canLayerSelection,
  zoom,
  onBringToFront,
  onSendToBack,
  onZoomIn,
  onZoomOut,
  onReset,
}: BoardControlsProps) => (
  <>
    <div className="fixed bottom-4 left-44 z-40 flex items-center gap-1 rounded-lg border border-zinc-300 bg-white p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] max-md:left-auto max-md:right-4">
      <button
        type="button"
        aria-label="Send selected shapes to back"
        title="Send to back"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canLayerSelection}
        onClick={onSendToBack}
      >
        <SendToBack size={18} strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Bring selected shapes to front"
        title="Bring to front"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canLayerSelection}
        onClick={onBringToFront}
      >
        <BringToFront size={18} strokeWidth={2} />
      </button>
      <div className="mx-1 h-6 w-px bg-zinc-200" />
      <button
        type="button"
        aria-label="Reset board"
        title="Reset board"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700 active:scale-95"
        onClick={onReset}
      >
        <Trash2 size={18} strokeWidth={2} />
      </button>
    </div>
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1 rounded-lg border border-zinc-300 bg-white p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <button
        type="button"
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={zoom <= minZoom}
        onClick={onZoomOut}
      >
        <Minus size={18} strokeWidth={2} />
      </button>
      <div className="min-w-14 text-center text-sm font-medium text-zinc-700">
        {Math.round(zoom * 100)}%
      </div>
      <button
        type="button"
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={zoom >= maxZoom}
        onClick={onZoomIn}
      >
        <Plus size={18} strokeWidth={2} />
      </button>
    </div>
  </>
);
