import React from 'react';

interface RadialGaugeProps {
  percent: number; // 0 to 100
  title: string;
  subtitle?: string;
  size?: number;
  currentValue?: string;
  targetValue?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  percent,
  title,
  subtitle,
  size = 200,
  currentValue,
  targetValue
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const totalTicks = 28;
  const activeTicks = Math.round((clampedPercent / 100) * totalTicks);

  // Radius and center
  const cx = size / 2;
  const cy = size / 2 + 15;
  const rOuter = (size / 2) - 16;
  const rInner = rOuter - 18;

  // Arc angles: from -190deg to +10deg (200 degree total sweep)
  const startAngle = -190;
  const endAngle = 10;
  const angleRange = endAngle - startAngle;

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    const fraction = i / (totalTicks - 1);
    const angleDeg = startAngle + fraction * angleRange;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);

    const isActive = i < activeTicks;
    ticks.push({
      id: i,
      x1,
      y1,
      x2,
      y2,
      isActive,
    });
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.75}`}>
        <defs>
          <filter id="roleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {ticks.map((t) => (
          <line
            key={t.id}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isActive ? 'var(--role-primary)' : 'var(--gauge-inactive, #cbd5e1)'}
            strokeWidth={4.5}
            strokeLinecap="round"
            className="transition-colors duration-300"
            filter={t.isActive ? 'url(#roleGlow)' : undefined}
          />
        ))}

        {/* Center Text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-slate-900 dark:fill-zinc-100 font-extrabold text-2xl"
          style={{ fontSize: '28px', fontWeight: 800 }}
        >
          {clampedPercent}%
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-zinc-400 font-medium text-xs tracking-wider"
          style={{ fontSize: '11px' }}
        >
          {title.toUpperCase()}
        </text>
      </svg>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 text-center -mt-2">{subtitle}</p>
      )}

      {(currentValue || targetValue) && (
        <div className="flex items-center justify-between w-full px-4 mt-3 pt-3 border-t border-slate-100 dark:border-obsidian-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Current</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentValue || '-'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Target</span>
            <span className="font-semibold text-role">{targetValue || '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
