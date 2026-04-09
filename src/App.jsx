import React, { useState, useCallback } from 'react';
import Sidebar, { cn } from './components/sidebar/Sidebar';
import MarkdownEditor from './components/editor/MarkdownEditor';
import MarkdownPreview from './components/editor/MarkdownPreview';
import StatusBanner from './components/StatusBanner';
import CommandPalette from './components/CommandPalette';
import { useOfflineStatus } from './hooks/useOfflineStatus';
import { useNoteStore } from './store/noteStore';
import { useThemeContext } from './hooks/useThemeContext';
import { useFocusMode } from './hooks/useFocusMode';
import { useAutoSave } from './hooks/useAutoSave';

function App() {
  const isOffline = useOfflineStatus();
  const { notes, activeNoteId } = useNoteStore();
  const { theme, toggleTheme } = useThemeContext();
  const { focusMode, toggleFocusMode } = useFocusMode();
  const { isSaving } = useAutoSave(500);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);
  const togglePreview = useCallback(() => setShowPreview(v => !v), []);

  return (
    <div
      className={cn(theme, 'cosmic-bg')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--app-bg)',
        position: 'relative',
        transition: 'background 0.6s ease',
      }}
    >
      {/* Dynamic Background energy orbs */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'var(--app-bg)',
          transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'drift 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'drift 25s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '20%', width: '25vw', height: '25vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'orbit 40s linear infinite'
        }} />
      </div>

      {/* Status Banner */}
      <StatusBanner isOffline={isOffline} isSaving={isSaving} />

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Filmstrip — Top Row */}
        {!focusMode && (
          <div
            className="filmstrip"
            style={{ height: '160px', flexShrink: 0, width: '100%', overflow: 'hidden', zIndex: 10, position: 'relative', borderBottom: '1px solid var(--border)' }}
          >
            <Sidebar
              theme={theme}
              toggleTheme={toggleTheme}
              onOpenCommandPalette={openCommandPalette}
              onToggleFocusMode={toggleFocusMode}
              focusMode={focusMode}
            />
          </div>
        )}

        {/* Editor + Preview Area — Bottom Row */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Editor pane */}
          <div className="float-pane" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
             // Center globally if no note is selected
            maxWidth: !notes.find(n => n.id === activeNoteId) ? '100%' : 'none'
          }}>
            <MarkdownEditor
              focusMode={focusMode}
              showPreview={showPreview}
              onTogglePreview={togglePreview}
            />
          </div>

          {/* Preview pane — hidden in focus mode or when toggled off, or when no note selected */}
          {!focusMode && showPreview && notes.find(n => n.id === activeNoteId) && (
            <div className="float-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', animationDelay: '0.2s' }}>
              <MarkdownPreview />
            </div>
          )}
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={closeCommandPalette}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Focus mode escape hint */}
      {focusMode && (
        <button
          onClick={toggleFocusMode}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 100,
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(10,10,18,0.85)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#A855F7',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚡</span> Exit Focus
          <kbd style={{
            background: 'rgba(124,58,237,0.2)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '9px',
            fontFamily: 'monospace',
          }}>Ctrl+F</kbd>
        </button>
      )}
    </div>
  );
}

export default App;
