import React from 'react';

interface TagCloudProps {
  tags: { text: string; count: number; weight: number }[];
  onTagClick?: (tag: string) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tags, onTagClick }) => {
  const getWeightClasses = (weight: number) => {
    switch (weight) {
      case 5:
        return 'text-base font-bold bg-role text-white border-role px-3.5 py-1.5 shadow-role-subtle';
      case 4:
        return 'text-sm font-semibold bg-role-subtle border-role-subtle text-role px-3 py-1';
      case 3:
        return 'text-xs font-medium bg-slate-100 dark:bg-obsidian-800 border-slate-200 dark:border-obsidian-700 text-slate-800 dark:text-zinc-200 px-2.5 py-1';
      case 2:
        return 'text-xs font-normal bg-slate-50 dark:bg-obsidian-850 border-slate-200/70 dark:border-obsidian-750 text-slate-600 dark:text-zinc-400 px-2.5 py-0.5';
      default:
        return 'text-[11px] font-normal bg-slate-50 dark:bg-obsidian-900 border-slate-200/50 dark:border-obsidian-800 text-slate-500 dark:text-zinc-500 px-2 py-0.5';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center p-3">
      {tags.map((tag) => (
        <button
          key={tag.text}
          type="button"
          onClick={() => onTagClick?.(tag.text)}
          className={`inline-flex items-center gap-1.5 rounded-xl border transition-all duration-150 hover:scale-105 hover:border-role ${getWeightClasses(
            tag.weight
          )}`}
        >
          <span>{tag.text}</span>
          <span className="text-[10px] opacity-65 font-mono">({tag.count})</span>
        </button>
      ))}
    </div>
  );
};
