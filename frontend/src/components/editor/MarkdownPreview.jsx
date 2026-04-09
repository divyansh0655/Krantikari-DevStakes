import React, { useMemo, useState } from 'react';
import { useNoteStore } from '../../store/noteStore';
import { convertFromRaw } from 'draft-js';
import { marked } from 'marked';
import { Copy, Check, List } from 'lucide-react';


marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownPreview() {
  const { notes, activeNoteId } = useNoteStore();
  const activeNote = notes.find(n => n.id === activeNoteId);
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(false);

  const { html, toc } = useMemo(() => {
    if (!activeNote?.content) return { html: '', toc: [] };
    try {
      const rawContent = JSON.parse(activeNote.content);
      const contentState = convertFromRaw(rawContent);
      const md = contentState.getPlainText('\n');
      const html = marked.parse(md, { breaks: true });

      // Extract headings for TOC
      const headingMatches = [...md.matchAll(/^(#{1,3})\s+(.+)$/gm)];
      const toc = headingMatches.map((m, i) => ({
        id: `h-${i}`,
        level: m[1].length,
        text: m[2].trim(),
      }));

      return { html, toc };
    } catch {
      return { html: '', toc: [] };
    }
  }, [activeNote]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!activeNote) return null;

  return (
    <div
      className="flex h-full max-h-screen rounded-2xl overflow-hidden m-2"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* TOC Sidebar */}
      {showToc && toc.length > 0 && (
        <div
          className="w-48 shrink-0 overflow-y-auto flex flex-col gap-1 p-4"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Contents</p>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block text-xs leading-relaxed transition-colors truncate py-0.5 hover:opacity-100 opacity-70"
              style={{
                color: item.level === 1 ? '#A855F7' : item.level === 2 ? '#06B6D4' : '#94A3B8',
                paddingLeft: `${(item.level - 1) * 12}px`,
                fontWeight: item.level === 1 ? '600' : '400',
              }}
            >
              {item.text}
            </a>
          ))}
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Preview Header */}
        <div
          className="px-6 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)', backdropFilter: 'blur(20px)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#475569' }}
          >
            Preview
          </p>
          <div className="flex items-center gap-1.5">
            {toc.length > 0 && (
              <button
                onClick={() => setShowToc(v => !v)}
                title="Toggle Table of Contents"
                className="p-1.5 rounded-lg transition-all text-xs flex items-center gap-1"
                style={{
                  background: showToc ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                  color: showToc ? '#06B6D4' : '#64748B',
                  border: `1px solid ${showToc ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleCopyHtml}
              title="Copy as HTML"
              className="p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs"
              style={{
                background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                color: copied ? '#10B981' : '#64748B',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'HTML'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: 'thin' }}>
          {html ? (
            <div
              className="markdown-preview max-w-none"
              dangerouslySetInnerHTML={{ __html: html.replace(/<img (.*)>/g, '<div class="image-halo-container"><img class="image-halo" $1></div>') }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <span className="text-4xl opacity-30">👁</span>
              <p className="text-sm italic" style={{ color: '#334155' }}>
                Type something to see the live preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
