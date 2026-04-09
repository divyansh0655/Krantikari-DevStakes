import React, { useMemo } from 'react';
import { Type, Hash, Clock, AlignLeft } from 'lucide-react';

function getStats(plainText) {
  if (!plainText || !plainText.trim()) {
    return { words: 0, chars: 0, lines: 0, readingTime: 0 };
  }
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const chars = plainText.length;
  const lines = plainText.split('\n').length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, chars, lines, readingTime };
}

export default function WordCountHUD({ plainText, isSaving }) {
  const { words, chars, lines, readingTime } = useMemo(() => getStats(plainText), [plainText]);

  return (
    <div className="word-count-hud">
      <div
        className="glass flex items-center gap-3 rounded-xl px-3 py-2 text-[11px] font-medium select-none"
        style={{
          background: 'rgba(10,10,18,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <StatItem icon={<Type className="w-3 h-3" />} value={words} label="words" color="#A855F7" />
        <div className="w-px h-3 bg-white/10" />
        <StatItem icon={<Hash className="w-3 h-3" />} value={chars} label="chars" color="#06B6D4" />
        <div className="w-px h-3 bg-white/10" />
        <StatItem icon={<AlignLeft className="w-3 h-3" />} value={lines} label="lines" color="#10B981" />
        <div className="w-px h-3 bg-white/10" />
        <StatItem
          icon={<Clock className="w-3 h-3" />}
          value={`${readingTime}m`}
          label="read"
          color="#F59E0B"
        />
        {isSaving && (
          <>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-purple-400 text-[10px] animate-pulse">saving…</span>
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon, value, label, color }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span style={{ color }}>{icon}</span>
      <span style={{ color: '#E2E8F0' }}>{value}</span>
      <span style={{ color: '#475569' }}>{label}</span>
    </div>
  );
}
