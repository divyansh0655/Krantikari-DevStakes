import React from 'react';
import { Wifi, WifiOff, Save, CheckCircle } from 'lucide-react';

export default function StatusBanner({ isOffline, isSaving }) {
  const show = isOffline || isSaving;

  return (
    <div
      className={`status-banner ${isOffline ? 'offline' : ''} overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center gap-2 text-sm font-medium`}
      style={{ height: show ? '36px' : '0px', opacity: show ? 1 : 0 }}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-xs tracking-wide">
            You're offline — all changes are saved locally via IndexedDB
          </span>
        </>
      ) : isSaving ? (
        <>
          <Save className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" style={{ color: 'var(--cyan)' }} />
          <span className="text-xs tracking-wide" style={{ color: 'var(--cyan)' }}>
            Saving to universe...
          </span>
        </>
      ) : null}
    </div>
  );
}
