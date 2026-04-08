import { useState, useCallback, useEffect } from 'react';
import { debounce } from '../lib/utils';
import { useNoteStore } from '../store/noteStore';

export function useAutoSave(delay = 500) {
  const { updateActiveNote } = useNoteStore();
  const [isSaving, setIsSaving] = useState(false);

  // Reusable debounced save logic
  const debouncedSave = useCallback(
    debounce(async (updates) => {
      setIsSaving(true);
      await updateActiveNote(updates);
      setIsSaving(false);
    }, delay),
    [updateActiveNote, delay]
  );

  useEffect(() => {
    const handleUnload = () => {
      debouncedSave.flush();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [debouncedSave]);

  return { isSaving, triggerSave: debouncedSave };
}
