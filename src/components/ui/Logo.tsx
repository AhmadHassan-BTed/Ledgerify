import React from 'react';

interface LogoProps {
  size?: number;
  showBadge?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  showBadge = true,
  className = ''
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={`flex-shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Ledgerify Logo"
    >
      <defs>
        <linearGradient id="ledgerify-tile-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14141e" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </linearGradient>
        <linearGradient id="ledgerify-border-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2f2f42" />
          <stop offset="100%" stopColor="#1b1b26" />
        </linearGradient>
        <linearGradient id="ledgerify-spine-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--role-accent, #a855f7)" />
          <stop offset="60%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="ledgerify-tier-dyn" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="ledgerify-spark-dyn" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="ledgerify-glow-dyn" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Obsidian Badge Tile (Optional) */}
      {showBadge && (
        <rect
          width="64"
          height="64"
          rx="16"
          fill="url(#ledgerify-tile-dyn)"
          stroke="url(#ledgerify-border-dyn)"
          strokeWidth="1.5"
        />
      )}

      {/* Ledger Monogram: Vertical Spine & Foundation Base */}
      <path
        d="M19 15C16.7909 15 15 16.7909 15 19V45C15 47.2091 16.7909 49 19 49H45C47.2091 49 49 47.2091 49 45C49 42.7909 47.2091 41 45 41H23V19C23 16.7909 21.2091 15 19 15Z"
        fill="url(#ledgerify-spine-dyn)"
      />

      {/* Mid Ledger Tier (Volume Stream) */}
      <rect x="29" y="29" width="16" height="6" rx="3" fill="url(#ledgerify-tier-dyn)" />

      {/* Top Ledger Tier (Yield Stream) */}
      <rect x="29" y="19" width="9" height="5" rx="2.5" fill="url(#ledgerify-spark-dyn)" />

      {/* Verification Spark Node (Intelligence Apex) */}
      <circle cx="44" cy="21.5" r="3.5" fill="url(#ledgerify-spark-dyn)" filter="url(#ledgerify-glow-dyn)" />
    </svg>
  );
};
