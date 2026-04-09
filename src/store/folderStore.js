import { create } from 'zustand';
import { db, getFolders, addFolder, deleteFolder as dbDeleteFolder } from '../lib/db';

export const useFolderStore = create((set, get) => ({
  folders: [],
  
  loadFolders: async () => {
    const fetchedFolders = await getFolders();
    set({ folders: fetchedFolders });
  },

  createFolder: async (name) => {
    const newFolder = {
      id: crypto.randomUUID(),
      name: name || 'New Folder',
      parentId: null,
      createdAt: Date.now()
    };
    await addFolder(newFolder);
    await get().loadFolders();
  },

  deleteFolder: async (id) => {
    await dbDeleteFolder(id);
    set((state) => ({
      folders: state.folders.filter(f => f.id !== id)
    }));
  }
}));
