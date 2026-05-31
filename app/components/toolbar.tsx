"use client"

import { Ban, Circle, Hand, LucideIcon, Minus, MousePointer2, RectangleHorizontal, StickyNote, Type } from 'lucide-react'
import React from 'react'
import { ShapeColor, Tool, useToolbar } from '../contexts/toolbar-context';

const toolbarItems: ToolbarItemInterface[] = [{
    name: "select",
    tooltip: "Select",
    icon: MousePointer2
}, {
    name: "hand",
    tooltip: "Move board",
    icon: Hand
}, {
    name: "rect",
    tooltip: "Rectangle",
    icon: RectangleHorizontal
}, {
    name: "circle",
    tooltip: "Circle",
    icon: Circle,    
}, {
    name: "line",
    tooltip: "Line",
    icon: Minus,
}, {
    name: "text",
    tooltip: "Text",
    icon: Type,
}, {
    name: "sticky",
    tooltip: "Sticky note",
    icon: StickyNote,
}]

const colorItems: { color: ShapeColor; tooltip: string }[] = [{
    color: "transparent",
    tooltip: "Transparent",
}, {
    color: "#38bdf8",
    tooltip: "Sky",
}, {
    color: "#a78bfa",
    tooltip: "Violet",
}, {
    color: "#f97316",
    tooltip: "Orange",
}, {
    color: "#22c55e",
    tooltip: "Green",
}, {
    color: "#ef4444",
    tooltip: "Red",
}, {
    color: "#facc15",
    tooltip: "Yellow",
}, {
    color: "#111827",
    tooltip: "Ink",
}]

const Toolbar = () => {
    return (
        <div className='
            flex items-center gap-1
            rounded-lg
            border border-zinc-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            p-2
            shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        >
            {toolbarItems.map((item, i) => {
                return <ToolbarItem 
                    key={i}
                    tooltip={item.tooltip}
                    name={item.name}
                    icon={item.icon} 
                />
            })}
        </div>
    )
}

export const ColorSidebar = ({
    onColorSelect,
}: {
    onColorSelect?: (color: ShapeColor) => void
}) => {
    return (
        <div className='
            flex flex-col items-center gap-1
            rounded-lg
            border border-zinc-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            p-2
            shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        >
            {colorItems.map((item) => (
                <ColorSidebarItem
                    key={item.color}
                    color={item.color}
                    tooltip={item.tooltip}
                    onColorSelect={onColorSelect}
                />
            ))}
        </div>
    )
}

interface ToolbarItemInterface {
    name: Tool
    tooltip: string
    icon: LucideIcon
}

const ToolbarItem = ({
  name,
  tooltip,
  icon: Icon,
}: ToolbarItemInterface) => {
    const { selectedTool, setSelectedTool } = useToolbar();
    const active = selectedTool === name;
    
    return (
        <button
            title={tooltip}
            className={`
                flex h-10 w-10 items-center justify-center
                rounded-lg
                border border-zinc-200 dark:border-zinc-700
                ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"} 
                ${active && "bg-zinc-100 dark:bg-zinc-700"}
                transition-all duration-150
                hover:bg-zinc-100 dark:hover:bg-zinc-700
                hover:text-zinc-900 dark:hover:text-zinc-100
                active:scale-95
            `}
            onClick={() => setSelectedTool(name)}
        >
            <Icon size={20} strokeWidth={2} />
        </button>
    );
};

const ColorSidebarItem = ({
  color,
  tooltip,
  onColorSelect,
}: {
  color: ShapeColor
  tooltip: string
  onColorSelect?: (color: ShapeColor) => void
}) => {
    const { selectedColor, setSelectedColor } = useToolbar();
    const active = selectedColor === color;
    
    return (
        <button
            type="button"
            title={tooltip}
            aria-label={tooltip}
            className={`
                flex h-10 w-10 items-center justify-center
                rounded-lg
                border
                ${active ? "border-zinc-900 bg-zinc-100 dark:border-zinc-300 dark:bg-zinc-700" : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"}
                transition-all duration-150
                hover:bg-zinc-100 dark:hover:bg-zinc-700
                active:scale-95
            `}
            onClick={() => {
                setSelectedColor(color);
                onColorSelect?.(color);
            }}
        >
            {color === "transparent" ? (
                <Ban size={20} strokeWidth={2} className="text-zinc-700 dark:text-zinc-400" />
            ) : (
                <span
                    className="h-5 w-5 rounded-full border border-zinc-300"
                    style={{ backgroundColor: color }}
                />
            )}
        </button>
    );
};

export default Toolbar
