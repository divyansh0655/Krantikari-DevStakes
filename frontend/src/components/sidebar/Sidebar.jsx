import React, { useEffect, useState, useRef } from 'react';
import { ContentState, convertToRaw } from 'draft-js';
import { useNoteStore } from '../../store/noteStore';
import { useFolderStore } from '../../store/folderStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { FilePlus, FileText, Trash2, Moon, Sun, Search, Upload, Folder, FolderPlus, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ theme, toggleTheme }) {
  const { notes, activeNoteId, loadNotes, createNote, setActiveNote, removeNote } = useNoteStore();
  const { folders, loadFolders, createFolder, deleteFolder } = useFolderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const contentState = ContentState.createFromText(text);
    const rawContent = JSON.stringify(convertToRaw(contentState));
    
    // remove .md extension for title
    const rawTitle = file.name.replace(/\.md$/i, '');
    await createNote(rawTitle, rawContent);
    
    // clear input so same file can be imported again if needed
    e.target.value = '';
  };

  useKeyboardShortcuts({
    newNote: createNote,
    focusSearch: () => {
      document.querySelector('.search-input')?.focus();
    }
  });

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, [loadNotes, loadFolders]);

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = note.title?.toLowerCase().includes(query) || false;
    const matchesContent = note.content?.toLowerCase().includes(query) || false;
    return matchesTitle || matchesContent;
  });

  const statelessNotes = filteredNotes.filter(n => !n.folderId);
  const groupedFolders = folders.map(f => ({
    ...f,
    notes: filteredNotes.filter(n => n.folderId === f.id)
  }));

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFolders(newSet);
  };
  
  const handleCreateFolder = () => {
    const name = window.prompt("Enter folder name:");
    if (name) createFolder(name);
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notes</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Import .md Note"
            >
              <Upload className="h-5 w-5" />
            </button>
            <input 
              type="file" 
              accept=".md" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImport} 
            />
            <button
              onClick={handleCreateFolder}
              className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="New Folder"
            >
              <FolderPlus className="h-5 w-5" />
            </button>
            <button
              onClick={() => createNote()}
              className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="New Note"
            >
              <FilePlus className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full">
        {filteredNotes.length === 0 && folders.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            {searchQuery ? "No matching notes found." : "No notes yet. Click the + button to create one."}
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2 w-full">
            {/* Render Folders First */}
            {groupedFolders.map((folder) => {
               const isExpanded = expandedFolders.has(folder.id) || searchQuery !== '';
               return (
                 <div key={folder.id} className="flex flex-col gap-1">
                   <div className="group relative flex items-center">
                     <button
                       onClick={(e) => toggleFolder(e, folder.id)}
                       className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-accent/50 hover:text-foreground font-medium pr-10"
                     >
                       {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                       <Folder className="h-4 w-4 shrink-0 text-primary/70" />
                       <span className="truncate">{folder.name}</span>
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         if (window.confirm('Delete folder and move notes out?')) {
                           deleteFolder(folder.id);
                           folder.notes.forEach(n => { /* could orphan them dynamically by reloading store */ });
                         }
                       }}
                       className="absolute right-2 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-accent rounded transition-all"
                       title="Delete Folder"
                     >
                       <Trash2 className="h-3.5 w-3.5" />
                     </button>
                   </div>
                   
                   {/* Render Notes under Folder */}
                   {isExpanded && (
                     <ul className="flex flex-col gap-1 pl-6">
                       {folder.notes.map(note => <NoteItem key={note.id} note={note} activeNoteId={activeNoteId} setActiveNote={setActiveNote} removeNote={removeNote} />)}
                       {folder.notes.length === 0 && !searchQuery && <div className="text-xs text-muted-foreground/50 py-1 px-3">Empty</div>}
                     </ul>
                   )}
                 </div>
               );
            })}

            {/* Render Stateless Notes */}
            {groupedFolders.length > 0 && statelessNotes.length > 0 && <div className="h-px bg-border my-2 mx-2 opacity-50" />}
            <ul className="flex flex-col gap-1">
              {statelessNotes.map(note => <NoteItem key={note.id} note={note} activeNoteId={activeNoteId} setActiveNote={setActiveNote} removeNote={removeNote} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteItem({ note, activeNoteId, setActiveNote, removeNote }) {
  return (
    <li className="group relative flex items-center">
      <button
        onClick={() => setActiveNote(note.id)}
        className={cn(
          "w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors pr-10",
          activeNoteId === note.id 
            ? "bg-accent text-accent-foreground font-medium" 
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate">{note.title || 'Untitled Note'}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Are you sure you want to delete this note?')) {
            removeNote(note.id);
          }
        }}
        className="absolute right-2 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-accent rounded transition-all"
        title="Delete Note"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
