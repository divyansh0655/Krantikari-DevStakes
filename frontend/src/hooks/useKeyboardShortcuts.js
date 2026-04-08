import { useEffect } from 'react';

const shortcuts = {
  'ctrl+n': 'newNote',
  'ctrl+s': 'forceSave',
  'ctrl+p': 'togglePreview',
  'ctrl+shift+f': 'focusSearch',
  'ctrl+/': 'showShortcuts',
};

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handler = (e) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');
      
      if (shortcuts[key] && handlers[shortcuts[key]]) {
        e.preventDefault();
        handlers[shortcuts[key]]();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}
