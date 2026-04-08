import { create } from 'zustand';
import { db, getNotes, addNote, deleteNote as dbDeleteNote } from '../lib/db';

export const useNoteStore = create((set, get) => ({
  notes: [],
  activeNoteId: null,
  
  loadNotes: async () => {
    const fetchedNotes = await getNotes();
    set({ notes: fetchedNotes });
    if (fetchedNotes.length > 0 && !get().activeNoteId) {
      set({ activeNoteId: fetchedNotes[0].id });
    }
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  createNote: async (initialTitle = 'Untitled Note', initialContent = '') => {
    const newNote = {
      id: crypto.randomUUID(),
      title: initialTitle,
      content: initialContent, // Raw Draft.js state goes here, empty initially
      folderId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
    };
    await addNote(newNote);
    await get().loadNotes();
    set({ activeNoteId: newNote.id });
  },

  updateActiveNote: async (updates) => {
    const { activeNoteId, loadNotes } = get();
    if (!activeNoteId) return;
    
    await db.notes.update(activeNoteId, {
      ...updates,
      updatedAt: Date.now()
    });
    
    // Update local state without fetching
    set((state) => ({
      notes: state.notes.map(n => n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n)
    }));
  },

  removeNote: async (id) => {
    await dbDeleteNote(id);
    
    // Update local state
    set((state) => {
      const newNotes = state.notes.filter(n => n.id !== id);
      const newActiveNoteId = state.activeNoteId === id 
        ? (newNotes.length > 0 ? newNotes[0].id : null) 
        : state.activeNoteId;
        
      return {
        notes: newNotes,
        activeNoteId: newActiveNoteId
      };
    });
  }
}));
