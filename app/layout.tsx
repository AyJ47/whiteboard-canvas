import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toolbar from "./components/toolbar";
import { ToolbarProvider } from "./contexts/toolbar-context";
import { ThemeProvider } from "./contexts/theme-context";
import { ThemeToggle } from "./components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drawzy",
  description: `A fully interactive, high-performance whiteboard built with Next.js, React, HTML5 Canvas, and Tailwind CSS. 
This project serves as a showcase for building complex canvas-based interactions coupled with DOM-based overlays in a modern React architecture.
`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col dark:bg-zinc-900 transition-colors">
        <ThemeProvider>
          <ToolbarProvider>
            <ThemeToggle />
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-md:w-[95%] max-md:overflow-x-auto">
              <Toolbar />
            </div>
            {children}
          </ToolbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
