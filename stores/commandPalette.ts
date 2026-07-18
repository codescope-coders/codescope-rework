"use client";

import { create } from "zustand";

interface CommandPaletteState {
  open: boolean;
  query: string;
  highlighted: number;
  openPalette: () => void;
  closePalette: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setHighlighted: (index: number) => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  query: "",
  highlighted: 0,
  openPalette: () => set({ open: true, query: "", highlighted: 0 }),
  closePalette: () => set({ open: false }),
  toggle: () =>
    set((s) =>
      s.open ? { open: false } : { open: true, query: "", highlighted: 0 },
    ),
  setQuery: (query) => set({ query, highlighted: 0 }),
  setHighlighted: (highlighted) => set({ highlighted }),
}));

export default useCommandPalette;
