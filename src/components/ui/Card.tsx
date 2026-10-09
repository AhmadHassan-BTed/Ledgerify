import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  glow = false
}) => {
  return (
    <div
      className={`relative bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/60 rounded-2xl p-5 transition-all duration-200 hover:border-obsidian-600/80 shadow-obsidian-card ${
        glow ? 'shadow-glow-subtle border-purple-500/30' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-obsidian-800/80">
          <div>
            {title && <h3 className="text-base font-semibold text-zinc-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
