"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/theme-context";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
