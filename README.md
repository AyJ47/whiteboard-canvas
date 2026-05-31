# Next.js Interactive Whiteboard

A fully interactive, high-performance whiteboard built with Next.js, React, HTML5 Canvas, and Tailwind CSS. 
This project serves as a showcase for building complex canvas-based interactions coupled with DOM-based overlays in a modern React architecture.

## Features

- **Drawing Tools:** Rectangle, Circle, Line drawing tools with customizable colors.
- **Selection & Manipulation:** Select, move, and resize shapes using bounding box handles.
- **Sticky Notes:** Add draggable, resizable sticky notes with customizable colors and typography.
- **Text Layer:** Add text directly onto the canvas with auto-fitting font sizes.
- **Infinite Canvas:** Hand tool for panning, plus keyboard/button-based zooming (25% to 400%).
- **Undo / Redo:** Full history tracking for all interactions with `Ctrl+Z` / `Ctrl+Y` shortcuts.
- **Dark Mode:** Seamless light/dark mode toggling that updates both DOM and Canvas elements.
- **Simulated Collaboration:** A "Fake Collaboration" layer displaying a remote user's cursor for presentation purposes.
- **Responsive Layout:** Adaptive toolbars and panels for both desktop and mobile viewing.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Architecture

The core of the application revolves around the `Board` component (`app/components/board.tsx`), which orchestrates state, events, and rendering.

### State Management
State is managed using React `useState` and `useRef` hooks. To maintain 60 FPS performance during high-frequency pointer events (dragging, resizing, drawing), the app utilizes an `interactionRef` to track transient states without causing constant React re-renders. 

### Rendering Strategy
The app uses a hybrid rendering approach:
- **HTML5 `<canvas>`:** Renders the grid, shapes (rectangles, circles, lines), and the blue selection bounding box. It uses standard 2D context methods optimized for speed (`app/features/board/canvas-rendering.ts`).
- **DOM Overlays (HTML/CSS):** Renders interactive elements that benefit from native browser capabilities like `textarea` (for Sticky Notes and inline Text Editing) and standard `div` elements (for the collaboration cursor).

## Libraries Used

- **Next.js (App Router):** Core framework.
- **React (v19):** UI rendering and state management.
- **Tailwind CSS (v4):** Styling and responsive design utility classes.
- **Lucide React:** Beautiful, consistent SVG icons used across toolbars and controls.

## Tradeoffs and Assumptions

1. **Canvas vs DOM:** While the background shapes are drawn on a canvas, text editing relies on floating HTML `<textarea>` elements. 
   - *Tradeoff:* This significantly simplifies text wrapping, text selection, and accessibility at the cost of having to carefully synchronize DOM element coordinates (using CSS transforms) with the canvas zoom and pan states.
2. **Local State History:** Undo/Redo is implemented by keeping snapshots of the entire board state in a history array. 
   - *Assumption:* The number of shapes remains reasonably small. If the board were to contain thousands of complex paths, a diff-based or command-based history (Command Pattern) would be more memory efficient than full snapshots. The history stack is currently capped at 50 actions to mitigate memory growth.

## Challenges Faced

1. **Coordinate Systems:** The biggest challenge in a whiteboard application is bridging the gap between "Screen Space" (where the mouse is) and "World Space" (where shapes live relative to zoom and pan). The `screenToWorld` and `zoomAtPoint` functions in `geometry.ts` were critical for solving this mathematically.
2. **React Render Cycle during Dragging:** Continuously updating a large state array during a drag operation causes micro-stutters in React. The solution was to capture the start positions in a `useRef` and calculate the delta strictly within `handlePointerMove`, only committing to the React history state upon `handlePointerUp`.
3. **Dynamic Cursors:** Ensuring the cursor changes to the correct resize arrow (e.g., `nwse-resize`) when hovering over specific bounding box corners required precise point-in-rect mathematical hit testing before delegating to the browser's CSS styling.
