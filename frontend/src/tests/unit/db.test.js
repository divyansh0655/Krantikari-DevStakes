import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, addNote, getNotes, deleteNote, addFolder, getFolders } from '../../lib/db';

describe('Database (Dexie) Operations', () => {
  beforeEach(async () => {
    // Clear the fake-indexeddb state to ensure isolated tests
    await db.notes.clear();
    await db.folders.clear();
  });

  afterEach(async () => {
    await db.notes.clear();
    await db.folders.clear();
  });

  it('adds and retrieves a note correctly', async () => {
    const mockNote = {
      id: 'note-123',
      title: 'Test Note',
      content: '{"blocks":[]}',
      folderId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false
    };

    await addNote(mockNote);
    
    const notes = await getNotes();
    expect(notes.length).toBe(1);
    expect(notes[0].id).toBe('note-123');
    expect(notes[0].title).toBe('Test Note');
  });

  it('soft-deletes a note perfectly mapping isDeleted truth values', async () => {
    const mockNote = {
      id: 'note-delete',
      title: 'To Be Deleted',
      content: '',
      folderId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false
    };

    await addNote(mockNote);
    await deleteNote('note-delete');
    
    const notesAfterDelete = await getNotes();
    // getNotes natively filters isDeleted! 
    expect(notesAfterDelete.length).toBe(0);
    
    // We can explicitly query Dexie to ensure it persists masked
    const maskedNote = await db.notes.get('note-delete');
    expect(maskedNote.isDeleted).toBe(true);
  });

  it('validates folder creation operations', async () => {
    await addFolder({
      id: 'folder-1',
      name: 'Work',
      parentId: null,
      createdAt: Date.now()
    });

    const folders = await getFolders();
    expect(folders.length).toBe(1);
    expect(folders[0].name).toBe('Work');
  });
});
