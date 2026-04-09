import Dexie from 'dexie';

export const db = new Dexie('MarkdownNotesDB');


db.version(1).stores({
  notes: 'id, title, folderId, createdAt, updatedAt, isDeleted',
  folders: 'id, name, parentId, createdAt',
  syncQueue: '++id, operation, entityType, entityId, timestamp, payload'
});


db.version(2).stores({
  notes: 'id, title, folderId, createdAt, updatedAt, isDeleted, isPinned, color',
  folders: 'id, name, parentId, createdAt, color',
  syncQueue: '++id, operation, entityType, entityId, timestamp, payload'
}).upgrade(tx => {
  return tx.table('notes').toCollection().modify(note => {
    note.isPinned = note.isPinned ?? false;
    note.color = note.color ?? 'default';
    note.tags = note.tags ?? [];
  });
});

export const addNote = async (note) => {
  return await db.notes.put(note);
};

export const getNotes = async () => {
  return await db.notes.filter(note => !note.isDeleted).reverse().sortBy('updatedAt');
};

export const deleteNote = async (id) => {
  return await db.notes.update(id, { isDeleted: true, updatedAt: Date.now() });
};

export const addFolder = async (folder) => {
  return await db.folders.put(folder);
};

export const getFolders = async () => {
  return await db.folders.toArray();
};

export const deleteFolder = async (id) => {
  return await db.folders.delete(id);
};
