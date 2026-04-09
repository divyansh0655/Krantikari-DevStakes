import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useNoteStore } from '../../store/noteStore';

const { mockUpdateActiveNote } = vi.hoisted(() => ({
  mockUpdateActiveNote: vi.fn().mockResolvedValue(true)
}));


vi.mock('../../store/noteStore', () => ({
  useNoteStore: () => ({
    updateActiveNote: mockUpdateActiveNote
  })
}));

describe('useAutoSave hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateActiveNote.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initially sets isSaving to false', () => {
    const { result } = renderHook(() => useAutoSave(500));
    expect(result.current.isSaving).toBe(false);
  });

  it('debounces the triggerSave execution', () => {
    const { result } = renderHook(() => useAutoSave(500));
    const store = useNoteStore();

    act(() => {
      result.current.triggerSave({ content: 'test update' });
    });
    
    
    expect(mockUpdateActiveNote).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(mockUpdateActiveNote).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300); 
    });
    
    expect(mockUpdateActiveNote).toHaveBeenCalledWith({ content: 'test update' });
  });

  it('provides a flush command that fires explicitly regardless of timeout', () => {
    const { result } = renderHook(() => useAutoSave(500));

    act(() => {
      result.current.triggerSave({ content: 'flushed async event' });
      result.current.triggerSave.flush();
    });

    expect(mockUpdateActiveNote).toHaveBeenCalled();
  });
});
