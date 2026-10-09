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
      className={`relative bg-white dark:bg-obsidian-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-obsidian-700/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-slate-300 dark:hover:border-obsidian-600/80 shadow-sm dark:shadow-obsidian-card ${
        glow ? 'shadow-role-subtle border-role/40' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-obsidian-800/80 gap-2">
          <div>
            {title && <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
