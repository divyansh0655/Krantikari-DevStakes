import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '../store/noteStore';
import { useFocusModeStore } from '../hooks/useFocusMode';
import { Search, FileText, Plus, Moon, Sun, Zap, X, ArrowRight, Command } from 'lucide-react';

const ACTIONS = [
  { id: 'new-note', label: 'New Note', description: 'Create a blank note', icon: Plus, category: 'Actions' },
  { id: 'focus-mode', label: 'Toggle Focus Mode', description: 'Ctrl+F — distraction-free writing', icon: Zap, category: 'Actions' },
];

export default function CommandPalette({ isOpen, onClose, toggleTheme, theme }) {
  const { notes, setActiveNote, createNote } = useNoteStore();
  const { toggleFocusMode } = useFocusModeStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const noteItems = notes.slice(0, 20).map(n => ({
    id: `note-${n.id}`,
    label: n.title || 'Untitled Note',
    description: `Open note`,
    icon: FileText,
    category: 'Notes',
    noteId: n.id,
  }));

  const actions = [
    ...ACTIONS,
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle the color theme',
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Actions'
    }
  ];

  const shortcuts = [
    { id: 'sc-new', label: 'New Note', description: 'Ctrl + N', icon: Plus, category: 'Shortcuts' },
    { id: 'sc-palette', label: 'Command Palette', description: 'Ctrl + K', icon: Search, category: 'Shortcuts' },
    { id: 'sc-focus', label: 'Focus Mode', description: 'Ctrl + F', icon: Zap, category: 'Shortcuts' },
    { id: 'sc-save', label: 'Force Save', description: 'Ctrl + S', icon: Zap, category: 'Shortcuts' },
    { id: 'sc-nav', label: 'Navigate Strip', description: 'Shift + Scroll', icon: ArrowRight, category: 'Shortcuts' },
  ];

  const allItems = [...actions, ...noteItems, ...shortcuts];

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const handleSelect = useCallback((item) => {
    if (item.noteId) {
      setActiveNote(item.noteId);
    } else if (item.id === 'new-note') {
      createNote();
    } else if (item.id === 'focus-mode') {
      toggleFocusMode();
    } else if (item.id === 'toggle-theme') {
      toggleTheme();
    }
    onClose();
  }, [setActiveNote, createNote, toggleFocusMode, toggleTheme, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatFiltered[activeIndex]) {
      handleSelect(flatFiltered[activeIndex]);
    }
  };

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div
        className="command-palette-panel glass-strong"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#7C3AED' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Search notes, run commands..."
            className="flex-1 bg-transparent outline-none text-base placeholder-slate-500"
            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--foreground)' }}
          />
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 text-[10px] font-mono">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto py-2">
          {flatFiltered.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-600 text-sm">
              No results for "<span className="text-slate-400">{query}</span>"
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {category}
                </div>
                {items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isActive = currentIndex === activeIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-100 group ${
                        isActive ? 'bg-purple-600/20' : 'hover:bg-white/[0.03]'
                      }`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? 'bg-purple-600/30' : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
                      }`}>
                        <Icon className="w-4 h-4" style={{ color: isActive ? '#A855F7' : '#64748B' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${isActive ? 'text-purple-200' : 'text-slate-300'}`}>
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{item.description}</div>
                      </div>
                      {isActive && (
                        <ArrowRight className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-white/[0.05] flex items-center gap-4 text-[10px] text-slate-700">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
