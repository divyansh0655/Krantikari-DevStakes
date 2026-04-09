import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useNoteStore } from '../../store/noteStore';
import { useFolderStore } from '../../store/folderStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import {
  Bold, Italic, Underline, Code, Download, Heading1, Heading2,
  Heading3, Quote, List, ListOrdered, Minus, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../sidebar/Sidebar';
import WordCountHUD from '../WordCountHUD';


function extractTags(text) {
  const matches = text.match(/#[\w]+/g) || [];
  return [...new Set(matches)];
}

const TAG_COLORS = [
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)', text: '#A855F7' },
  { bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)',  text: '#06B6D4' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10B981' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#F59E0B' },
  { bg: 'rgba(244,63,94,0.15)',  border: 'rgba(244,63,94,0.4)',  text: '#F43F5E' },
];

function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function MarkdownEditor({ focusMode, showPreview, onTogglePreview }) {
  const { notes, activeNoteId, updateActiveNote } = useNoteStore();
  const { folders } = useFolderStore();
  const activeNote = notes.find(n => n.id === activeNoteId);
  const { isSaving, triggerSave } = useAutoSave(500);
  const isOffline = useOfflineStatus();

  useKeyboardShortcuts({ forceSave: () => triggerSave.flush() });

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [title, setTitle] = useState('');
  const [plainText, setPlainText] = useState('');
  const editorRef = useRef(null);

  
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || '');
      if (activeNote.content) {
        try {
          const contentState = convertFromRaw(JSON.parse(activeNote.content));
          const newState = EditorState.createWithContent(contentState);
          setEditorState(newState);
          setPlainText(contentState.getPlainText('\n'));
        } catch (e) {
          setEditorState(EditorState.createEmpty());
          setPlainText('');
        }
      } else {
        setEditorState(EditorState.createEmpty());
        setPlainText('');
      }
    }
  }, [activeNoteId]);

  const pulseClass = isSaving ? 'pulse-red' : isOffline ? 'pulse-amber' : 'pulse-teal';
  const tags = useMemo(() => extractTags(plainText), [plainText]);

  if (!activeNote) {
    return (
      <div
        className="editor-container flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl m-2 animate-pop"
        style={{
          background: 'transparent',
          border: '1px solid transparent', 
        }}
      >
        <div className="text-center space-y-4 max-w-md">
          <div
            className="text-8xl mb-8 select-none"
            style={{ animation: 'float-pane 4s ease-in-out infinite' }}
          >
            ✦
          </div>
          <h2
            className="text-5xl font-black tracking-tighter uppercase"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #4F7676)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Zerolat
          </h2>
          <p className="text-sm px-8 leading-relaxed" style={{ color: '#64748B' }}>
            A minimalist workspace for your digital consciousness. 
            Choose a shard from the stream above or manifest a new one.
          </p>
          <div className="pt-6">
             <kbd className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 text-xs font-mono">
               Press <span className="text-purple-400">Ctrl + K</span> for commands
             </kbd>
          </div>
        </div>
      </div>
    );
  }
  const onChange = (newState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    const text = content.getPlainText('\n');
    setPlainText(text);
    triggerSave({ content: rawContent });
  };

  const onTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    triggerSave({ title: newTitle });
  };

  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) { onChange(newState); return 'handled'; }
    return 'not-handled';
  };

  const toggleInline = (style) => onChange(RichUtils.toggleInlineStyle(editorState, style));
  const toggleBlock = (type) => onChange(RichUtils.toggleBlockType(editorState, type));

  const handleExport = () => {
    const text = editorState.getCurrentContent().getPlainText('\n');
    const tags = extractTags(text);
    const frontmatter = `---\ntitle: ${title || 'Untitled'}\ntags: [${tags.join(', ')}]\nupdated: ${new Date().toISOString()}\n---\n\n`;
    const blob = new Blob([frontmatter + text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'Untitled'}.md`; a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div
      className={cn(
        'editor-container flex-1 flex flex-col h-full max-h-full rounded-2xl overflow-hidden transition-all duration-300',
        !focusMode && pulseClass
      )}
      style={{
        background: 'var(--card)',
        border: '1.5px solid var(--border)',
        margin: focusMode ? '0' : '8px',
        borderRadius: focusMode ? '0' : undefined,
      }}
    >
      {/* Floating Image Preview Overlay */}
      <ImagePreviewOverlay />

      {/* Header */}
      <div
        className="px-6 pt-5 pb-3 flex flex-col gap-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)', backdropFilter: 'blur(20px)' }}
      >
        {/* Title row */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Note Title..."
            className="flex-1 bg-transparent outline-none font-bold text-xl placeholder-opacity-30"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#E2E8F0',
              letterSpacing: '-0.01em',
            }}
            onFocus={e => e.target.style.color = '#fff'}
            onBlur={e => e.target.style.color = '#E2E8F0'}
          />
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeNote.folderId || ''}
              onChange={(e) => updateActiveNote({ folderId: e.target.value || null })}
              className="text-xs rounded-lg px-2 py-1.5 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <option value="">No Folder</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            <div
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{
                color: isSaving ? '#A855F7' : isOffline ? '#FCD34D' : '#10B981',
                background: isSaving ? 'rgba(124,58,237,0.1)' : isOffline ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${isSaving ? 'rgba(124,58,237,0.2)' : isOffline ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }}
            >
              {isSaving ? '⬆ Saving' : isOffline ? '⚡ Offline' : '✓ Saved'}
            </div>
          </div>
        </div>

        {/* Tags strip */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => {
              const c = tagColor(tag);
              return (
                <span key={tag} className="tag-chip" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 items-center">
            <ToolbarGroup>
              <TB label="B" title="Bold (Ctrl+B)" onClick={() => toggleInline('BOLD')} />
              <TB label={<em>I</em>} title="Italic (Ctrl+I)" onClick={() => toggleInline('ITALIC')} />
              <TB label={<u>U</u>} title="Underline" onClick={() => toggleInline('UNDERLINE')} />
              <TB label={<Code className="w-3.5 h-3.5" />} title="Inline Code" onClick={() => toggleInline('CODE')} />
            </ToolbarGroup>
            <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <ToolbarGroup>
              <TB label={<Heading1 className="w-3.5 h-3.5" />} title="Heading 1" onClick={() => toggleBlock('header-one')} />
              <TB label={<Heading2 className="w-3.5 h-3.5" />} title="Heading 2" onClick={() => toggleBlock('header-two')} />
              <TB label={<Heading3 className="w-3.5 h-3.5" />} title="Heading 3" onClick={() => toggleBlock('header-three')} />
            </ToolbarGroup>
            <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <ToolbarGroup>
              <TB label={<Quote className="w-3.5 h-3.5" />} title="Blockquote" onClick={() => toggleBlock('blockquote')} />
              <TB label={<List className="w-3.5 h-3.5" />} title="Bullet List" onClick={() => toggleBlock('unordered-list-item')} />
              <TB label={<ListOrdered className="w-3.5 h-3.5" />} title="Numbered List" onClick={() => toggleBlock('ordered-list-item')} />
              <TB label={<Minus className="w-3.5 h-3.5" />} title="Code Block" onClick={() => toggleBlock('code-block')} />
            </ToolbarGroup>
          </div>

          <div className="flex gap-1">
            <TB
              label={showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
              onClick={onTogglePreview}
              active={showPreview}
              accent="#06B6D4"
            />
            <TB
              label={<Download className="w-3.5 h-3.5" />}
              title="Export as .md with frontmatter"
              onClick={handleExport}
            />
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="flex-1 overflow-y-auto px-10 py-8 cursor-text relative"
        style={{ 
          scrollbarWidth: 'thin',
          marginTop: 'var(--s-4)', 
        }}
        onClick={() => editorRef.current?.focus()}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          placeholder="Start writing... use #tags, **bold**, _italic_"
          blockStyleFn={(contentBlock) => {
            const type = contentBlock.getType();
            if (type === 'header-one') return 'public-DraftStyleDefault-header-one';
            if (type === 'header-two') return 'public-DraftStyleDefault-header-two';
            if (type === 'header-three') return 'public-DraftStyleDefault-header-three';
            if (type === 'blockquote') return 'public-DraftStyleDefault-blockquote';
            if (type === 'unordered-list-item') return 'public-DraftStyleDefault-unordered-list-item';
            if (type === 'ordered-list-item') return 'public-DraftStyleDefault-ordered-list-item';
            return '';
          }}
        />

        {/* Word Count HUD */}
        <WordCountHUD plainText={plainText} isSaving={isSaving} />
      </div>
    </div>
  );
}

function ImagePreviewOverlay() {
  const [preview, setPreview] = useState({ show: false, url: '', x: 0, y: 0 });

  useEffect(() => {
    const handleMouseOver = (e) => {
     
      const target = e.target;
      const text = target.innerText || "";
      const imgMatch = text.match(/!\[.*\]\((.*)\)/);
      
      if (imgMatch && imgMatch[1]) {
        setPreview({ show: true, url: imgMatch[1], x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e) => {
      if (preview.show) {
        setPreview(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      }
    };

    const handleMouseOut = () => {
      setPreview(prev => ({ ...prev, show: false }));
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [preview.show]);

  if (!preview.show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: preview.x + 20,
        top: preview.y - 120,
        zIndex: 9999,
        pointerEvents: 'none',
        padding: '6px',
        background: 'var(--surface-3)',
        border: '1px solid var(--primary-glow)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-depth)',
        animation: 'pop-in 0.2s ease-out'
      }}
    >
      <img 
        src={preview.url} 
        alt="Preview" 
        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
        onError={() => setPreview(p => ({ ...p, show: false }))}
      />
    </div>
  );
}

function ToolbarGroup({ children }) {
  return <div className="flex gap-0.5">{children}</div>;
}

function TB({ label, onClick, title, active, accent = '#A855F7' }) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:scale-110"
      style={{
        background: active ? `${accent}22` : 'rgba(255,255,255,0.04)',
        color: active ? accent : '#64748B',
        border: `1px solid ${active ? `${accent}44` : 'rgba(255,255,255,0.07)'}`,
        minWidth: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}15`; e.currentTarget.style.color = accent; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? `${accent}22` : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = active ? accent : '#64748B'; }}
    >
      {label}
    </button>
  );
}
