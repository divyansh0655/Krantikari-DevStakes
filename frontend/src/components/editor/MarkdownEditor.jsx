import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useNoteStore } from '../../store/noteStore';
import { useFolderStore } from '../../store/folderStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Bold, Italic, Underline, Code, Download } from 'lucide-react';

export default function MarkdownEditor() {
  const { notes, activeNoteId, updateActiveNote } = useNoteStore();
  const { folders } = useFolderStore();
  const activeNote = notes.find(n => n.id === activeNoteId);
  const { isSaving, triggerSave } = useAutoSave(500);
  
  useKeyboardShortcuts({
    forceSave: () => triggerSave.flush()
  });

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty()
  );
  const [title, setTitle] = useState('');

  // Sync state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || '');
      if (activeNote.content) {
        try {
          const contentState = convertFromRaw(JSON.parse(activeNote.content));
          setEditorState(EditorState.createWithContent(contentState));
        } catch (e) {
          console.error("Error parsing note content", e);
        }
      } else {
        setEditorState(EditorState.createEmpty());
      }
    }
  }, [activeNoteId]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select or create a note to begin editing.
      </div>
    );
  }

  const onChange = (newState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    
    // Auto save content changes
    triggerSave({ content: rawContent });
  };

  const onTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto save title changes
    triggerSave({ title: newTitle });
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    onChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleExport = () => {
    const plainText = editorState.getCurrentContent().getPlainText('\n');
    const blob = new Blob([plainText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Untitled note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen">
      {/* Editor Header / Toolbar */}
      <div className="p-4 border-b border-border bg-background flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <input 
            type="text"
            className="text-2xl font-bold bg-transparent outline-none w-full text-foreground placeholder-muted-foreground"
            value={title}
            onChange={onTitleChange}
            placeholder="Note Title"
          />
          <div className="flex items-center gap-3 ml-4">
            <select
              className="bg-transparent border border-border text-sm rounded-md px-2 py-1 text-muted-foreground outline-none"
              value={activeNote.folderId || ''}
              onChange={(e) => updateActiveNote({ folderId: e.target.value || null })}
            >
              <option value="">No Folder</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {isSaving ? 'Saving...' : 'Saved'}
            </div>
          </div>
        </div>
        
        {/* Simple Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <ToolbarButton icon={<Bold size={16} />} onClick={() => toggleInlineStyle('BOLD')} />
            <ToolbarButton icon={<Italic size={16} />} onClick={() => toggleInlineStyle('ITALIC')} />
            <ToolbarButton icon={<Underline size={16} />} onClick={() => toggleInlineStyle('UNDERLINE')} />
            <ToolbarButton icon={<Code size={16} />} onClick={() => toggleInlineStyle('CODE')} />
          </div>
          <div className="flex gap-2">
            <ToolbarButton icon={<Download size={16} />} onClick={handleExport} title="Export as Markdown" />
          </div>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="flex-1 overflow-y-auto p-8 cursor-text text-lg leading-relaxed">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          placeholder="Start typing your awesome markdown notes..."
        />
      </div>
    </div>
  );
}

const ToolbarButton = ({ icon, onClick }) => (
  <button 
    className="p-1.5 rounded bg-accent/50 hover:bg-accent text-accent-foreground transition-colors"
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()} // Prevent draft-js blur
  >
    {icon}
  </button>
);
