import React from 'react';

interface LogoProps {
  size?: number;
  showBadge?: boolean;
  className?: string;
  glow?: boolean;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  showBadge = true,
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={`flex-shrink-0 select-none transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="Ledgerify Logo"
    >
      {/* Clean Solid Squircle Badge */}
      {showBadge && (
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="12"
          className="fill-slate-900 dark:fill-obsidian-900 stroke-slate-200 dark:stroke-obsidian-750"
          strokeWidth="1.5"
        />
      )}

      {/* Clean Minimalist Geometric Ledger 'L' Monogram */}
      <g transform="translate(10, 10)">
        {/* Vertical Ledger Spine - Primary Indigo */}
        <rect
          x="2"
          y="2"
          width="6.5"
          height="24"
          rx="3.25"
          fill="#6366f1"
        />

        {/* Horizontal Foundation Base - Deep Indigo Shade */}
        <rect
          x="2"
          y="19.5"
          width="24"
          height="6.5"
          rx="3.25"
          fill="#4f46e5"
        />

        {/* Mid Analytical Step - Light Lavender Shade */}
        <rect
          x="11.5"
          y="11"
          width="14.5"
          height="5.5"
          rx="2.75"
          fill="#a5b4fc"
        />

        {/* Top Momentum Node - Crisp Accent */}
        <rect
          x="19.5"
          y="2"
          width="6.5"
          height="5.5"
          rx="2.75"
          fill="#c7d2fe"
        />
      </g>
    </svg>
  );
};
