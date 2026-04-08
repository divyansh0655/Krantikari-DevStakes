import React, { useMemo } from 'react';
import { useNoteStore } from '../../store/noteStore';
import { convertFromRaw } from 'draft-js';
import { marked } from 'marked';

export default function MarkdownPreview() {
  const { notes, activeNoteId } = useNoteStore();
  const activeNote = notes.find(n => n.id === activeNoteId);

  const previewHtml = useMemo(() => {
    if (!activeNote || !activeNote.content) return '';
    
    try {
      const rawContent = JSON.parse(activeNote.content);
      const contentState = convertFromRaw(rawContent);
      const plainText = contentState.getPlainText('\n');
      
      // Parse the plain markdown text into HTML using marked
      return marked.parse(plainText, { breaks: true });
    } catch (e) {
      return '';
    }
  }, [activeNote]);

  if (!activeNote) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-card text-card-foreground border-l border-border h-full max-h-screen">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-2">Preview</h2>
      <div 
        className="prose prose-invert max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: previewHtml || '<span class="text-muted-foreground italic">Type something to see the preview...</span>' }}
      />
    </div>
  );
}
