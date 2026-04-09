import { useEffect } from 'react';

const shortcuts = {
  'ctrl+n': 'newNote',
  'ctrl+s': 'forceSave',
  'ctrl+p': 'togglePreview',
  'ctrl+shift+f': 'focusSearch',
  'ctrl+/': 'showShortcuts',
  'ctrl+k': 'commandPalette',
  'ctrl+f': 'focusMode',
};

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handler = (e) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'ctrl',
        e.shiftKey && 'shift',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      const action = shortcuts[key];
      if (action && handlers[action]) {
        e.preventDefault();
        handlers[action]();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}
