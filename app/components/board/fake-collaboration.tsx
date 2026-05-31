"use client";

import { MousePointer2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Point } from "../../features/board/types";

interface FakeCollaborationProps {
  viewportOffset: Point;
  zoom: number;
}

export const FakeCollaboration = ({
  viewportOffset,
  zoom,
}: FakeCollaborationProps) => {
  const [cursorPos, setCursorPos] = useState<Point>({ x: 500, y: 500 });
  const [targetPos, setTargetPos] = useState<Point>({ x: 500, y: 500 });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Periodically pick a new target position
    const targetInterval = setInterval(() => {
      setTargetPos({
        x: Math.random() * 2000,
        y: Math.random() * 1500,
      });

      // Randomly decide if they are "editing" when they reach the target
      if (Math.random() > 0.5) {
        setIsEditing(true);
        setTimeout(() => setIsEditing(false), 2000 + Math.random() * 3000);
      }
    }, 3000);

    return () => clearInterval(targetInterval);
  }, []);

  useEffect(() => {
    // Smoothly animate towards the target
    let animationFrameId: number;

    const animate = () => {
      setCursorPos((current) => {
        const dx = targetPos.x - current.x;
        const dy = targetPos.y - current.y;

        // Easing factor
        const ease = 0.05;

        return {
          x: current.x + dx * ease,
          y: current.y + dy * ease,
        };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPos]);

  // Calculate screen coordinates for the fake cursor
  const screenX = viewportOffset.x + cursorPos.x * zoom;
  const screenY = viewportOffset.y + cursorPos.y * zoom;

  return (
    <>
      {/* Fake Cursor Layer */}
      <div
        className="pointer-events-none absolute z-50 flex flex-col items-start transition-transform duration-75"
        style={{
          transform: `translate(${screenX}px, ${screenY}px)`,
        }}
      >
        <MousePointer2
          size={24}
          className="text-pink-500 -ml-[10px] -mt-[10px] origin-top-left"
          fill="currentColor"
        />
        <div className="ml-3 mt-1 rounded-md bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white shadow-md">
          Alice
        </div>
      </div>

      {/* Editing State Label in the corner */}
      <div
        className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 shadow-sm transition-opacity duration-300 ${
          isEditing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600">
          <User size={14} />
        </div>
        <span className="text-sm font-medium text-pink-700">
          Alice is editing...
        </span>
      </div>
    </>
  );
};
