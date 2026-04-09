import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';

function getStreak() {
  try {
    const raw = localStorage.getItem('krantikari_streak');
    if (!raw) return initStreak();
    const data = JSON.parse(raw);
    const today = new Date().toDateString();
    const last = new Date(data.lastDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (last === today) return data.count;
    if (last === yesterday) {
      const updated = { count: data.count + 1, lastDate: today };
      localStorage.setItem('krantikari_streak', JSON.stringify(updated));
      return updated.count;
    }
   
    return resetStreak();
  } catch {
    return initStreak();
  }
}

function initStreak() {
  const today = new Date().toDateString();
  localStorage.setItem('krantikari_streak', JSON.stringify({ count: 1, lastDate: today }));
  return 1;
}

function resetStreak() {
  const today = new Date().toDateString();
  localStorage.setItem('krantikari_streak', JSON.stringify({ count: 1, lastDate: today }));
  return 1;
}

export default function StreakCounter() {
  const streak = useMemo(() => getStreak(), []);

  if (streak < 1) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold select-none"
      title={`${streak} day writing streak!`}
      style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        color: '#FCD34D',
      }}
    >
      <Flame className="w-3.5 h-3.5 text-amber-400" />
      <span>{streak}d</span>
    </div>
  );
}
