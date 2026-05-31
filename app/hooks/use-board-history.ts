import { useCallback, useState } from "react";
import { BoardShape, StickyNote } from "../features/board/types";

export const useBoardHistory = (
  initialShapes: BoardShape[],
  initialNotes: StickyNote[]
) => {
  const [history, setHistory] = useState<{ shapes: BoardShape[]; stickyNotes: StickyNote[] }[]>([
    { shapes: initialShapes, stickyNotes: initialNotes },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const commitToHistory = useCallback((shapes: BoardShape[], stickyNotes: StickyNote[]) => {
    setHistory((currentHistory) => {
      const newHistory = currentHistory.slice(0, historyIndex + 1);
      newHistory.push({ shapes, stickyNotes });
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex((current) => Math.min(current + 1, 50));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      return prev;
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      return next;
    }
    return null;
  }, [history, historyIndex]);

  const resetHistory = useCallback((shapes: BoardShape[], stickyNotes: StickyNote[]) => {
    setHistory([{ shapes, stickyNotes }]);
    setHistoryIndex(0);
  }, []);

  return {
    historyIndex,
    historyLength: history.length,
    commitToHistory,
    undo,
    redo,
    resetHistory,
  };
};
