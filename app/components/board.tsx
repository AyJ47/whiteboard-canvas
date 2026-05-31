"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShapeColor, useToolbar } from "../contexts/toolbar-context";
import { ColorSidebar } from "./toolbar";
import { BoardControls } from "./board/board-controls";
import { StickyNotesLayer } from "./board/sticky-notes-layer";
import { TextEditor } from "./board/text-editor";
import {
  getStickyNoteFontSize,
  getVisibleTextColor,
  initialShapes,
  initialStickyNotes,
  keyboardZoomStep,
  maxStickyNoteFontSize,
  minShapeSize,
  minStickyNoteFontSize,
  minStickyNoteHeight,
  minStickyNoteWidth,
} from "../features/board/constants";
import { drawGrid, drawSelection, drawShape, drawTransformer } from "../features/board/canvas-rendering";
import { isEditableTarget } from "../features/board/dom";
import {
  boxesIntersect,
  clampZoom,
  getBoxFromPoints,
  getCanvasPoint,
  getResizeHandleAtPoint,
  getResizedBox,
  getShapeBox,
  getShapesBox,
  getWindowSize,
  pointInShape,
  resizeShapeFromBox,
  screenToWorld,
} from "../features/board/geometry";
import { createStickyNote, createTextShape, drawingTools } from "../features/board/shapes";
import { loadStoredBoardState, saveStoredBoardState } from "../features/board/storage";
import { getFittedTextFontSize } from "../features/board/text";
import {
  BoardShape,
  BoardSize,
  Interaction,
  Point,
  SelectionBox,
  StickyNote,
  TextShape,
} from "../features/board/types";

const Board = () => {
  const { selectedTool, setSelectedTool, selectedColor } = useToolbar();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);
  const interactionRef = useRef<Interaction>({ type: "idle" });
  const [boardSize, setBoardSize] = useState<BoardSize>(getWindowSize);
  const [viewportOffset, setViewportOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [shapes, setShapes] = useState<BoardShape[]>(initialShapes);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialStickyNotes);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStickyNoteId, setSelectedStickyNoteId] = useState<string | null>(null);
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [draftShape, setDraftShape] = useState<BoardShape | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [editingTextShapeId, setEditingTextShapeId] = useState<string | null>(null);

  const selectedShapes = shapes.filter((shape) => selectedIds.includes(shape.id));
  const selectedBox = selectedTool === "select" ? getShapesBox(selectedShapes) : null;
  const drawingFactory = drawingTools[selectedTool];
  const isHandTool = selectedTool === "hand";
  const isStickyTool = selectedTool === "sticky";
  const isTextTool = selectedTool === "text";
  const stickyNoteScale = zoom;
  const editingTextShape = shapes.find(
    (shape): shape is TextShape =>
      shape.type === "text" && shape.id === editingTextShapeId
  );

  useEffect(() => {
    let mounted = true;

    queueMicrotask(() => {
      if (!mounted) {
        return;
      }

      const storedState = loadStoredBoardState();

      if (storedState) {
        setShapes(storedState.shapes);
        setStickyNotes(storedState.stickyNotes);
        setViewportOffset(storedState.viewportOffset);
        setZoom(storedState.zoom);
      }

      setStorageReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveStoredBoardState({
      version: 1,
      shapes,
      stickyNotes,
      viewportOffset,
      zoom,
    });
  }, [shapes, stickyNotes, storageReady, viewportOffset, zoom]);

  useEffect(() => {
    if (!editingTextShapeId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      textEditorRef.current?.focus({ preventScroll: true });
      textEditorRef.current?.select();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [editingTextShapeId]);

  const zoomAtPoint = useCallback((screenPoint: Point, nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom);

    setViewportOffset((currentOffset) => {
      const worldPoint = screenToWorld(screenPoint, currentOffset, zoom);

      return {
        x: screenPoint.x - worldPoint.x * clampedZoom,
        y: screenPoint.y - worldPoint.y * clampedZoom,
      };
    });
    setZoom(clampedZoom);
  }, [zoom]);

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(getWindowSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAtPoint(
          { x: boardSize.width / 2, y: boardSize.height / 2 },
          zoom * keyboardZoomStep
        );
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomAtPoint(
          { x: boardSize.width / 2, y: boardSize.height / 2 },
          zoom / keyboardZoomStep
        );
        return;
      }

      if (event.key !== "Backspace" && event.key !== "Delete") {
        if (event.key === "Enter" && selectedIds.length === 1) {
          const selectedShape = shapes.find((shape) => shape.id === selectedIds[0]);

          if (selectedShape?.type === "text") {
            event.preventDefault();
            setEditingTextShapeId(selectedShape.id);
          }
        }

        return;
      }

      if (selectedIds.length === 0 && !selectedStickyNoteId) {
        return;
      }

      event.preventDefault();
      setShapes((currentShapes) =>
        currentShapes.filter((shape) => !selectedIds.includes(shape.id))
      );
      setStickyNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== selectedStickyNoteId)
      );
      setSelectedIds([]);
      setSelectedStickyNoteId(null);
      setDraggingIds([]);
      setDraftShape(null);
      setSelectionBox(null);
      setEditingTextShapeId(null);
      interactionRef.current = { type: "idle" };
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [boardSize, selectedIds, selectedStickyNoteId, shapes, zoom, zoomAtPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = boardSize.width * pixelRatio;
    canvas.height = boardSize.height * pixelRatio;
    canvas.style.width = `${boardSize.width}px`;
    canvas.style.height = `${boardSize.height}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, boardSize.width, boardSize.height);
    drawGrid(context, boardSize, viewportOffset, zoom);

    context.save();
    context.translate(viewportOffset.x, viewportOffset.y);
    context.scale(zoom, zoom);

    shapes.forEach((shape) => {
      drawShape(context, shape, draggingIds.includes(shape.id));
    });

    if (draftShape) {
      drawShape(context, draftShape, true);
    }

    if (selectedBox) {
      drawTransformer(context, selectedBox, zoom);
    }

    drawSelection(context, selectionBox);

    context.restore();
  }, [boardSize, draftShape, draggingIds, selectedBox, selectionBox, shapes, viewportOffset, zoom]);

  const hitTestShape = (point: Point) => {
    for (let index = shapes.length - 1; index >= 0; index -= 1) {
      if (pointInShape(point, shapes[index])) {
        return shapes[index];
      }
    }

    return null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const point = getCanvasPoint(event, canvas);
    const worldPoint = screenToWorld(point, viewportOffset, zoom);
    canvas.setPointerCapture(event.pointerId);

    if (isHandTool) {
      interactionRef.current = {
        type: "panning",
        start: point,
        startViewportOffset: viewportOffset,
      };
      setSelectedStickyNoteId(null);
      setDraggingIds([]);
      setSelectionBox(null);
      return;
    }

    if (isStickyTool) {
      const note = createStickyNote(worldPoint);

      setStickyNotes((currentNotes) => [...currentNotes, note]);
      setSelectedTool("select");
      setSelectedIds([]);
      setSelectedStickyNoteId(note.id);
      setDraggingIds([]);
      setSelectionBox(null);
      interactionRef.current = { type: "idle" };
      return;
    }

    if (isTextTool) {
      const textShape = createTextShape(worldPoint, selectedColor);

      setShapes((currentShapes) => [...currentShapes, textShape]);
      setSelectedTool("select");
      setSelectedIds([textShape.id]);
      setSelectedStickyNoteId(null);
      setDraggingIds([]);
      setSelectionBox(null);
      setEditingTextShapeId(textShape.id);
      interactionRef.current = { type: "idle" };
      return;
    }

    if (drawingFactory) {
      setSelectedTool("select");
      interactionRef.current = {
        type: "drawing",
        start: worldPoint,
        fill: selectedColor,
        createShape: drawingFactory,
      };
      setSelectedIds([]);
      setSelectedStickyNoteId(null);
      setEditingTextShapeId(null);
      setDraftShape(drawingFactory("draft-shape", worldPoint, worldPoint, selectedColor));
      return;
    }

    if (selectedBox) {
      const handle = getResizeHandleAtPoint(worldPoint, selectedBox, zoom);

      if (handle) {
        interactionRef.current = {
          type: "resizing",
          handle,
          startBox: selectedBox,
          startShapes: selectedShapes,
        };
        setDraggingIds([]);
        return;
      }
    }

    const hitShape = hitTestShape(worldPoint);

    if (hitShape) {
      const metaPressed = event.shiftKey || event.ctrlKey || event.metaKey;
      const isSelected = selectedIds.includes(hitShape.id);

      if (metaPressed && isSelected) {
        const nextSelectedIds = selectedIds.filter((id) => id !== hitShape.id);
        setSelectedIds(nextSelectedIds);
        interactionRef.current = { type: "idle" };
        return;
      }

      const nextSelectedIds =
        metaPressed && !isSelected ? [...selectedIds, hitShape.id] : isSelected ? selectedIds : [hitShape.id];
      const nextSelectedShapes = shapes.filter((shape) => nextSelectedIds.includes(shape.id));

      setSelectedIds(nextSelectedIds);
      setSelectedStickyNoteId(null);
      setEditingTextShapeId(null);

      if (hitShape.type === "text" && event.detail > 1) {
        setEditingTextShapeId(hitShape.id);
        setDraggingIds([]);
        interactionRef.current = { type: "idle" };
        return;
      }

      setDraggingIds(nextSelectedIds);
      interactionRef.current = {
        type: "dragging",
        start: worldPoint,
        ids: nextSelectedIds,
        startShapes: nextSelectedShapes,
      };
      return;
    }

    interactionRef.current = { type: "selecting", start: worldPoint };
    setSelectedIds([]);
    setSelectedStickyNoteId(null);
    setEditingTextShapeId(null);
    setDraggingIds([]);
    setSelectionBox({
      visible: true,
      start: worldPoint,
      end: worldPoint,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const point = getCanvasPoint(event, canvas);
    const worldPoint = screenToWorld(point, viewportOffset, zoom);
    const interaction = interactionRef.current;

    if (interaction.type === "panning") {
      setViewportOffset({
        x: interaction.startViewportOffset.x + point.x - interaction.start.x,
        y: interaction.startViewportOffset.y + point.y - interaction.start.y,
      });
      return;
    }

    if (interaction.type === "drawing") {
      setDraftShape(
        interaction.createShape(
          "draft-shape",
          interaction.start,
          worldPoint,
          interaction.fill
        )
      );
      return;
    }

    if (interaction.type === "selecting") {
      setSelectionBox({
        visible: true,
        start: interaction.start,
        end: worldPoint,
      });
      return;
    }

    if (interaction.type === "dragging") {
      const deltaX = worldPoint.x - interaction.start.x;
      const deltaY = worldPoint.y - interaction.start.y;

      setShapes((currentShapes) =>
        currentShapes.map((shape) => {
          const startShape = interaction.startShapes.find(
            (currentShape) => currentShape.id === shape.id
          );

          if (!startShape) {
            return shape;
          }

          return {
            ...shape,
            x: startShape.x + deltaX,
            y: startShape.y + deltaY,
          };
        })
      );
      return;
    }

    if (interaction.type === "resizing") {
      const nextBox = getResizedBox(interaction.handle, interaction.startBox, worldPoint);

      setShapes((currentShapes) =>
        currentShapes.map((shape) => {
          const startShape = interaction.startShapes.find(
            (currentShape) => currentShape.id === shape.id
          );

          if (!startShape) {
            return shape;
          }

          return resizeShapeFromBox(startShape, interaction.startBox, nextBox);
        })
      );
      return;
    }

    if (interaction.type === "draggingNote") {
      const deltaX = (event.clientX - interaction.start.x) / zoom;
      const deltaY = (event.clientY - interaction.start.y) / zoom;

      setStickyNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === interaction.note.id
            ? {
                ...note,
                x: interaction.note.x + deltaX,
                y: interaction.note.y + deltaY,
              }
          : note
      )
    );
      return;
    }

    if (interaction.type === "resizingNote") {
      const deltaX = (event.clientX - interaction.start.x) / stickyNoteScale;
      const deltaY = (event.clientY - interaction.start.y) / stickyNoteScale;

      setStickyNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === interaction.note.id
            ? {
                ...note,
                width: Math.max(minStickyNoteWidth, interaction.note.width + deltaX),
                height: Math.max(minStickyNoteHeight, interaction.note.height + deltaY),
              }
            : note
        )
      );
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    const interaction = interactionRef.current;

    if (interaction.type === "drawing" && draftShape) {
      const draftBox = getShapeBox(draftShape);

      if (draftBox.width >= minShapeSize && draftBox.height >= minShapeSize) {
        setShapes((currentShapes) => [
          ...currentShapes,
          {
            ...draftShape,
            id: `${draftShape.type}-${crypto.randomUUID()}`,
          },
        ]);
      }

      setDraftShape(null);
    }

    if (interaction.type === "selecting" && selectionBox) {
      const box = getBoxFromPoints(selectionBox.start, selectionBox.end);

      if (box.width < 2 && box.height < 2) {
        setSelectedIds([]);
      } else {
        setSelectedIds(
          shapes
            .filter((shape) => boxesIntersect(box, getShapeBox(shape)))
            .map((shape) => shape.id)
        );
      }

      setSelectionBox(null);
    }

    setDraggingIds([]);
    interactionRef.current = { type: "idle" };
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (interactionRef.current.type !== "idle") {
      handlePointerUp(event);
    }
  };

  const focusStickyNote = (noteId: string) => {
    setSelectedStickyNoteId(noteId);
    setSelectedIds([]);
    setEditingTextShapeId(null);
    setDraggingIds([]);
    setSelectionBox(null);
  };

  const handleStickyNoteDragStart = (
    event: React.PointerEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedStickyNoteId(note.id);
    setSelectedIds([]);
    setEditingTextShapeId(null);
    setDraggingIds([]);
    setSelectionBox(null);
    interactionRef.current = {
      type: "draggingNote",
      pointerId: event.pointerId,
      start: {
        x: event.clientX,
        y: event.clientY,
      },
      note,
    };
  };

  const handleStickyNoteDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;

    if (
      interaction.type !== "draggingNote" ||
      interaction.pointerId !== event.pointerId
    ) {
      return;
    }

    event.stopPropagation();
    const deltaX = (event.clientX - interaction.start.x) / zoom;
    const deltaY = (event.clientY - interaction.start.y) / zoom;

    setStickyNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === interaction.note.id
          ? {
              ...note,
              x: interaction.note.x + deltaX,
              y: interaction.note.y + deltaY,
            }
          : note
      )
    );
  };

  const handleStickyNoteDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const interaction = interactionRef.current;

    if (
      interaction.type === "draggingNote" &&
      interaction.pointerId === event.pointerId
    ) {
      event.stopPropagation();
      interactionRef.current = { type: "idle" };
    }
  };

  const handleStickyNoteResizeStart = (
    event: React.PointerEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedStickyNoteId(note.id);
    setSelectedIds([]);
    setEditingTextShapeId(null);
    setDraggingIds([]);
    setSelectionBox(null);
    interactionRef.current = {
      type: "resizingNote",
      pointerId: event.pointerId,
      start: {
        x: event.clientX,
        y: event.clientY,
      },
      note,
    };
  };

  const handleStickyNoteResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;

    if (
      interaction.type !== "resizingNote" ||
      interaction.pointerId !== event.pointerId
    ) {
      return;
    }

    event.stopPropagation();
    const deltaX = (event.clientX - interaction.start.x) / stickyNoteScale;
    const deltaY = (event.clientY - interaction.start.y) / stickyNoteScale;

    setStickyNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === interaction.note.id
          ? {
              ...note,
              width: Math.max(minStickyNoteWidth, interaction.note.width + deltaX),
              height: Math.max(minStickyNoteHeight, interaction.note.height + deltaY),
            }
          : note
      )
    );
  };

  const handleStickyNoteResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const interaction = interactionRef.current;

    if (
      interaction.type === "resizingNote" &&
      interaction.pointerId === event.pointerId
    ) {
      event.stopPropagation();
      interactionRef.current = { type: "idle" };
    }
  };

  const updateStickyNoteContent = (noteId: string, content: string) => {
    setStickyNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId ? { ...note, content } : note
      )
    );
  };

  const updateTextShapeContent = (shapeId: string, content: string) => {
    const context = canvasRef.current?.getContext("2d");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        if (shape.id !== shapeId || shape.type !== "text") {
          return shape;
        }

        return {
          ...shape,
          content,
          fontSize: context
            ? getFittedTextFontSize(context, shape, content)
            : shape.fontSize,
        };
      })
    );
  };

  const updateStickyNoteColor = (noteId: string, color: string) => {
    setStickyNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === noteId ? { ...note, color } : note))
    );
  };

  const updateStickyNoteFontSize = (noteId: string, delta: number) => {
    setStickyNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              fontSize: Math.min(
                maxStickyNoteFontSize,
                Math.max(minStickyNoteFontSize, getStickyNoteFontSize(note) + delta)
              ),
            }
          : note
      )
    );
  };

  const deleteStickyNote = (noteId: string) => {
    setStickyNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId)
    );
    setSelectedStickyNoteId((currentId) => (currentId === noteId ? null : currentId));
    interactionRef.current = { type: "idle" };
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const point = getCanvasPoint(event, canvas);
      const nextZoom = zoom * (event.deltaY > 0 ? 1 / keyboardZoomStep : keyboardZoomStep);
      zoomAtPoint(point, nextZoom);
      return;
    }

    setViewportOffset((currentOffset) => ({
      x: currentOffset.x - event.deltaX,
      y: currentOffset.y - event.deltaY,
    }));
  };

  const zoomAroundCenter = (nextZoom: number) => {
    zoomAtPoint({ x: boardSize.width / 2, y: boardSize.height / 2 }, nextZoom);
  };

  const moveSelectedShapes = (direction: "front" | "back") => {
    if (selectedIds.length === 0) {
      return;
    }

    setShapes((currentShapes) => {
      const selectedShapes = currentShapes.filter((shape) =>
        selectedIds.includes(shape.id)
      );
      const remainingShapes = currentShapes.filter(
        (shape) => !selectedIds.includes(shape.id)
      );

      return direction === "front"
        ? [...remainingShapes, ...selectedShapes]
        : [...selectedShapes, ...remainingShapes];
    });
  };

  const handleColorSelect = (color: ShapeColor) => {
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : editingTextShapeId
          ? [editingTextShapeId]
          : [];

    if (targetIds.length === 0) {
      return;
    }

    const fill = getVisibleTextColor(color);

    setShapes((currentShapes) =>
      currentShapes.map((shape) =>
        targetIds.includes(shape.id)
          ? {
              ...shape,
              fill: shape.type === "text" ? fill : color,
            }
          : shape
      )
    );

    if (editingTextShapeId && targetIds.includes(editingTextShapeId)) {
      requestAnimationFrame(() => textEditorRef.current?.focus());
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="block h-screen w-screen touch-none"
        style={{
          cursor: isHandTool
            ? "grab"
            : isStickyTool || isTextTool
              ? "copy"
              : "default",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      />
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <StickyNotesLayer
          notes={stickyNotes}
          selectedNoteId={selectedStickyNoteId}
          viewportOffset={viewportOffset}
          zoom={zoom}
          onColorChange={updateStickyNoteColor}
          onContentChange={updateStickyNoteContent}
          onDelete={deleteStickyNote}
          onFontSizeChange={updateStickyNoteFontSize}
          onFocusNote={focusStickyNote}
          onDragStart={handleStickyNoteDragStart}
          onDragMove={handleStickyNoteDragMove}
          onDragEnd={handleStickyNoteDragEnd}
          onResizeStart={handleStickyNoteResizeStart}
          onResizeMove={handleStickyNoteResizeMove}
          onResizeEnd={handleStickyNoteResizeEnd}
        />
        {editingTextShape && (
          <TextEditor
            editorRef={textEditorRef}
            shape={editingTextShape}
            viewportOffset={viewportOffset}
            zoom={zoom}
            onChange={(content) => updateTextShapeContent(editingTextShape.id, content)}
            onExit={() => setEditingTextShapeId(null)}
          />
        )}
      </div>
      <div className="fixed left-4 top-1/2 z-40 -translate-y-1/2">
        <ColorSidebar onColorSelect={handleColorSelect} />
      </div>
      <BoardControls
        canLayerSelection={selectedIds.length > 0}
        zoom={zoom}
        onBringToFront={() => moveSelectedShapes("front")}
        onSendToBack={() => moveSelectedShapes("back")}
        onZoomIn={() => zoomAroundCenter(zoom * keyboardZoomStep)}
        onZoomOut={() => zoomAroundCenter(zoom / keyboardZoomStep)}
      />
    </div>
  );
};

export default Board;
