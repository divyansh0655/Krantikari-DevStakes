import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ContentState, convertToRaw } from 'draft-js';
import { useNoteStore } from '../../store/noteStore';
import { useFolderStore } from '../../store/folderStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import {
  FilePlus, FileText, Trash2, Moon, Sun, Search, Upload,
  Folder, FolderPlus, ChevronRight, ChevronDown, Pin, PinOff,
  Palette, Command, Zap, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import StreakCounter from '../StreakCounter';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const NOTE_COLORS = [
  { id: 'default', label: 'Default', hex: '#ffffff15' },
  { id: 'purple',  label: 'Aurora',  hex: '#7C3AED' },
  { id: 'cyan',    label: 'Slate',   hex: '#4F7676' }, 
  { id: 'emerald', label: 'Forest',  hex: '#10B981' },
  { id: 'amber',   label: 'Blaze',   hex: '#F59E0B' },
  { id: 'rose',    label: 'Cherry',  hex: '#F43F5E' },
];

export default function Sidebar({ theme, toggleTheme, onOpenCommandPalette, onToggleFocusMode, focusMode }) {
  const { notes, activeNoteId, loadNotes, createNote, setActiveNote, removeNote, pinNote, unpinNote, setNoteColor } = useNoteStore();
  const { folders, loadFolders, createFolder, deleteFolder } = useFolderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [colorPickerNoteId, setColorPickerNoteId] = useState(null);
  const fileInputRef = useRef(null);
  const filmstripRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const contentState = ContentState.createFromText(text);
    const rawContent = JSON.stringify(convertToRaw(contentState));
    const rawTitle = file.name.replace(/\.md$/i, '');
    await createNote(rawTitle, rawContent);
    e.target.value = '';
  };

  useKeyboardShortcuts({
    newNote: createNote,
    focusSearch: () => document.querySelector('.search-input')?.focus(),
    commandPalette: onOpenCommandPalette,
    focusMode: onToggleFocusMode,
  });

  
  useEffect(() => {
    const el = filmstripRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, [loadNotes, loadFolders]);

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (note.title?.toLowerCase().includes(query)) ||
           (note.content?.toLowerCase().includes(query));
  });

  const statelessNotes = filteredNotes.filter(n => !n.folderId);
  const groupedFolders = folders.map(f => ({
    ...f,
    notes: filteredNotes.filter(n => n.folderId === f.id)
  }));

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedFolders(newSet);
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Enter folder name:');
    if (name) createFolder(name);
  };

  const handleColorSelect = (noteId, colorId) => {
    setNoteColor(noteId, colorId);
    setColorPickerNoteId(null);
  };

  return (
    <div
      className="filmstrip w-full flex flex-col h-full overflow-hidden transition-all duration-500"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Toolbar */}
      <div
        className="px-4 py-2 flex flex-row items-center justify-between gap-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4 h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-4 pr-4 border-r border-white/10" style={{ height: '24px' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-xl shadow-teal-500/10"
              style={{ 
                background: 'linear-gradient(145deg, #4F7676, #212126)', 
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                letterSpacing: '-1px'
              }}
            >
              Ζ
            </div>
            <h1
              className="text-lg font-black tracking-tighter uppercase hidden sm:block"
              style={{ 
                background: 'linear-gradient(135deg, #FFFFFF, #4F7676)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text',
                letterSpacing: '-0.05em'
              }}
            >
              Zerolat<span className="opacity-40 ml-1" style={{ color: 'var(--cyan)' }}>✦</span>
            </h1>
          </div>

          {/* Selector Section (Streak) */}
          <div className="flex items-center gap-4 h-full px-2 border-r border-white/10" style={{ height: '24px' }}>
            <StreakCounter />
          </div>

          {/* Search Section */}
          <div className="relative ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search universe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-56 pl-10 pr-4 py-2 text-xs rounded-xl outline-none transition-all"
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-recessed)',
                color: 'var(--foreground)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1">
          <SidebarButton
            icon={<Command className="h-4 w-4" />}
            onClick={onOpenCommandPalette}
            title="Command Palette (Ctrl+K)"
          />
          <SidebarButton
            icon={<Zap className="h-4 w-4" style={{ color: focusMode ? '#A855F7' : undefined }} />}
            onClick={onToggleFocusMode}
            title="Focus Mode (Ctrl+F)"
            active={focusMode}
          />
          <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <SidebarButton
            icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            onClick={toggleTheme}
            title="Toggle Theme"
          />
          <SidebarButton
            icon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            title="Import .md Note"
          />
          <input type="file" accept=".md" ref={fileInputRef} className="hidden" onChange={handleImport} />
          <SidebarButton
            icon={<FolderPlus className="h-4 w-4" />}
            onClick={handleCreateFolder}
            title="New Folder"
          />
          <button
            onClick={() => createNote()}
            title="New Note (Ctrl+N)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: '#fff',
              boxShadow: '0 0 16px rgba(124,58,237,0.4)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.4)'}
          >
            <FilePlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Film Strip */}
      <div
        ref={filmstripRef}
        className="flex-1 overflow-x-auto overflow-y-hidden w-full flex items-center px-4 py-3 gap-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredNotes.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full gap-3 text-center">
            <div className="text-3xl mb-1">📝</div>
            <p className="text-xs font-medium" style={{ color: '#475569' }}>
              {searchQuery ? `No matches for "${searchQuery}"` : 'No notes yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => createNote()}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold mt-1 transition-all hover:scale-105"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                Create your first note →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-row gap-3 h-full items-center">
            {/* Folders */}
            {groupedFolders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id) || searchQuery !== '';
              return (
                <div key={folder.id} className="flex flex-row gap-3 items-center h-full shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '12px' }}>
                  <FolderCard folder={folder} isExpanded={isExpanded} toggleFolder={toggleFolder} deleteFolder={deleteFolder} />
                  {isExpanded && folder.notes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={activeNoteId === note.id}
                      setActiveNote={setActiveNote}
                      removeNote={removeNote}
                      pinNote={pinNote}
                      unpinNote={unpinNote}
                      onColorPicker={() => setColorPickerNoteId(note.id)}
                      colorPickerOpen={colorPickerNoteId === note.id}
                      onColorSelect={handleColorSelect}
                      onCloseColorPicker={() => setColorPickerNoteId(null)}
                    />
                  ))}
                </div>
              );
            })}

            {/* Stateless Notes */}
            {statelessNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                setActiveNote={setActiveNote}
                removeNote={removeNote}
                pinNote={pinNote}
                unpinNote={unpinNote}
                onColorPicker={() => setColorPickerNoteId(note.id)}
                colorPickerOpen={colorPickerNoteId === note.id}
                onColorSelect={handleColorSelect}
                onCloseColorPicker={() => setColorPickerNoteId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-0 hidden">
        <p className="text-xs" style={{ color: '#1E293B' }}>Shift+Scroll to navigate</p>
      </div>
    </div>
  );
}

function SidebarButton({ icon, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg transition-all duration-150 hover:scale-110"
      style={{
        color: active ? '#A855F7' : '#64748B',
        background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? '#A855F7' : '#64748B'; e.currentTarget.style.background = active ? 'rgba(124,58,237,0.15)' : 'transparent'; }}
    >
      {icon}
    </button>
  );
}

function FolderCard({ folder, isExpanded, toggleFolder, deleteFolder }) {
  return (
    <div className="group relative flex items-center h-full shrink-0 snap-center">
      <button
        onClick={(e) => toggleFolder(e, folder.id)}
        className="h-full flex flex-col justify-center items-center gap-2 px-5 py-2 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02]"
        style={{
          minWidth: '90px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          color: '#64748B',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
      >
        <Folder className="h-7 w-7" style={{ color: '#06B6D4' }} />
        <span className="truncate max-w-[80px] text-xs font-medium" style={{ color: '#94A3B8' }}>{folder.name}</span>
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Delete this folder?')) deleteFolder(folder.id);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
        style={{ color: '#F43F5E', background: 'rgba(244,63,94,0.1)' }}
        title="Delete Folder"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

const COLOR_GLOW_MAP = {
  purple: 'note-glow-purple',
  cyan: 'note-glow-cyan',
  emerald: 'note-glow-emerald',
  amber: 'note-glow-amber',
  rose: 'note-glow-rose',
  default: 'note-glow-default',
};

const COLOR_HEX_MAP = {
  purple: '#7C3AED',
  cyan: '#4F7676', 
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  default: 'rgba(255,255,255,0.08)',
};

function NoteCard({ note, isActive, setActiveNote, removeNote, pinNote, unpinNote, onColorPicker, colorPickerOpen, onColorSelect, onCloseColorPicker }) {
  const color = note.color || 'default';
  const glowClass = COLOR_GLOW_MAP[color] || 'note-glow-default';
  const accentColor = COLOR_HEX_MAP[color] || 'rgba(255,255,255,0.12)';

  let snippet = '';
  try {
    if (note.content) {
      const raw = JSON.parse(note.content);
      const blocks = raw.blocks || [];
      snippet = blocks.map(b => b.text).join(' ').slice(0, 60);
    }
  } catch {/* ignore */}

  const timeAgo = getTimeAgo(note.updatedAt);

  return (
    <div className="group relative flex items-center h-full shrink-0 snap-center animate-pop py-2" style={{ width: '110px' }}>
      <button
        onClick={() => setActiveNote(note.id)}
        className={cn(
          'h-full w-full flex flex-col items-start justify-between rounded-md text-sm transition-all duration-300 text-left overflow-hidden relative',
          isActive ? [glowClass, 'glass-shine-hover'] : 'note-glow-default',
        )}
        style={{
          background: isActive
            ? `linear-gradient(165deg, rgba(${hexToRgb(accentColor)}, 0.1), var(--surface-1))`
            : 'var(--surface-2)',
          border: isActive
            ? `1px solid ${accentColor}88`
            : '1px solid var(--border)',
          transform: isActive ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
          perspective: '1000px',
          boxShadow: isActive ? 'var(--shadow-depth)' : 'var(--shadow-recessed)',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)'; }}}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = 'scale(1)'; }}}
      >
        {/* Code Palette Indicator (Side bar) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
          style={{ background: accentColor, opacity: isActive ? 1 : 0.4 }}
        />

        <div className="w-full h-full pl-5 pr-2 py-4 flex flex-col justify-between">
          <div className="w-full">
            {/* Pin indicator */}
            {note.isPinned && (
              <div className="mb-2">
                <Pin className="w-2.5 h-2.5" style={{ color: accentColor }} />
              </div>
            )}
            <p
              className="text-[11px] font-black uppercase tracking-tight break-words leading-[1.1]"
              style={{
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontFamily: 'Inter, sans-serif',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {note.title || 'Untitled'}
            </p>
          </div>

          <div className="w-full space-y-2">
            {snippet && (
              <p className="text-[8px] opacity-60 line-clamp-2 italic" style={{ color: 'var(--muted-foreground)', lineHeight: '1.2' }}>
                {snippet}
              </p>
            )}
            <p className="text-[8px] font-bold tracking-widest opacity-40 uppercase" style={{ color: 'var(--muted-foreground)' }}>{timeAgo}</p>
          </div>
        </div>
      </button>

      {/* Actions overlay */}
      <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionButton
          icon={note.isPinned ? <PinOff className="h-2.5 w-2.5" /> : <Pin className="h-2.5 w-2.5" />}
          onClick={(e) => { e.stopPropagation(); note.isPinned ? unpinNote(note.id) : pinNote(note.id); }}
          title={note.isPinned ? 'Unpin' : 'Pin'}
          color="#F59E0B"
        />
        <ActionButton
          icon={<Palette className="h-2.5 w-2.5" />}
          onClick={(e) => { e.stopPropagation(); onColorPicker(); }}
          title="Set color"
          color="#A855F7"
        />
        <ActionButton
          icon={<Trash2 className="h-2.5 w-2.5" />}
          onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this note?')) removeNote(note.id); }}
          title="Delete"
          color="#F43F5E"
        />
      </div>

      {/* Color picker popover — Now an overlay so it doesn't get clipped by the filmstrip overflow */}
      {colorPickerOpen && (
        <div
          className="absolute inset-2 z-50 p-2 rounded-lg flex gap-1.5 flex-wrap items-center justify-center animate-pop"
          style={{
            background: 'rgba(10,10,18,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCloseColorPicker}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 hover:bg-red-500/40 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          {NOTE_COLORS.map(c => (
            <button
              key={c.id}
              onClick={(e) => { e.stopPropagation(); onColorSelect(note.id, c.id); }}
              title={c.label}
              className="w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer border-2"
              style={{
                background: c.hex,
                borderColor: note.color === c.id ? '#fff' : 'transparent',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, onClick, title, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-0.5 rounded transition-all"
      style={{ color, background: `${color}15` }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}15`}
    >
      {icon}
    </button>
  );
}

function hexToRgb(hex) {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return '255,255,255';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '255,255,255';
}

function getTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
