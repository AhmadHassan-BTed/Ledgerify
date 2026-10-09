import React from 'react';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const s = status.toLowerCase();

  let colorClasses = 'bg-zinc-800 text-zinc-300 border-zinc-700';

  if (s.includes('paid')) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (s.includes('partial')) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (s.includes('refund')) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (s.includes('cancel')) {
    colorClasses = 'bg-zinc-800 text-zinc-400 border-zinc-700 line-through';
  } else if (s.includes('urgent')) {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold animate-pulse';
  } else if (s.includes('reorder')) {
    colorClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  } else if (s.includes('optimal') || s.includes('healthy')) {
    colorClasses = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border capitalize whitespace-nowrap ${padding} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
