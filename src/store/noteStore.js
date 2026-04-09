import { create } from 'zustand';
import { db, getNotes, addNote, deleteNote as dbDeleteNote } from '../lib/db';

export const useNoteStore = create((set, get) => ({
  notes: [],
  activeNoteId: null,

  loadNotes: async () => {
    const fetchedNotes = await getNotes();
   
    const sorted = [...fetchedNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    set({ notes: sorted });
    if (sorted.length > 0 && !get().activeNoteId) {
      set({ activeNoteId: sorted[0].id });
    }
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  createNote: async (initialTitle = 'Untitled Note', initialContent = '') => {
    const newNote = {
      id: crypto.randomUUID(),
      title: initialTitle,
      content: initialContent,
      folderId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
      isPinned: false,
      color: 'default',
      tags: [],
    };
    await addNote(newNote);
    await get().loadNotes();
    set({ activeNoteId: newNote.id });
  },

  updateActiveNote: async (updates) => {
    const { activeNoteId } = get();
    if (!activeNoteId) return;

    await db.notes.update(activeNoteId, {
      ...updates,
      updatedAt: Date.now()
    });

    set((state) => ({
      notes: state.notes.map(n =>
        n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    }));
  },

  pinNote: async (id) => {
    await db.notes.update(id, { isPinned: true, updatedAt: Date.now() });
    set((state) => {
      const updated = state.notes.map(n =>
        n.id === id ? { ...n, isPinned: true } : n
      );
      return {
        notes: updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        })
      };
    });
  },

  unpinNote: async (id) => {
    await db.notes.update(id, { isPinned: false, updatedAt: Date.now() });
    set((state) => {
      const updated = state.notes.map(n =>
        n.id === id ? { ...n, isPinned: false } : n
      );
      return {
        notes: updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        })
      };
    });
  },

  setNoteColor: async (id, color) => {
    await db.notes.update(id, { color, updatedAt: Date.now() });
    set((state) => ({
      notes: state.notes.map(n => n.id === id ? { ...n, color } : n)
    }));
  },

  removeNote: async (id) => {
    await dbDeleteNote(id);
    set((state) => {
      const newNotes = state.notes.filter(n => n.id !== id);
      const newActiveNoteId =
        state.activeNoteId === id
          ? newNotes.length > 0 ? newNotes[0].id : null
          : state.activeNoteId;
      return { notes: newNotes, activeNoteId: newActiveNoteId };
    });
  }
}));
