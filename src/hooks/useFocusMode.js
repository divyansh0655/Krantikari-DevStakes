import { useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { create } from 'zustand';


export const useFocusModeStore = create((set) => ({
  focusMode: false,
  setFocusMode: (v) => set({ focusMode: v }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
}));

export function useFocusMode() {
  const { focusMode, toggleFocusMode } = useFocusModeStore();


  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => document.body.classList.remove('focus-mode');
  }, [focusMode]);

  useKeyboardShortcuts({
    focusMode: toggleFocusMode,
  });

  return { focusMode, toggleFocusMode };
}
