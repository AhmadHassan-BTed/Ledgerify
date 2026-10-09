import React from 'react';

interface TagCloudProps {
  tags: { text: string; count: number; weight: number }[];
  onTagClick?: (tag: string) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tags, onTagClick }) => {
  const getWeightClasses = (weight: number) => {
    switch (weight) {
      case 5:
        return 'text-base font-bold bg-purple-600/25 border-purple-500/50 text-purple-200 px-3.5 py-1.5 shadow-glow-subtle';
      case 4:
        return 'text-sm font-semibold bg-purple-700/20 border-purple-600/40 text-purple-300 px-3 py-1';
      case 3:
        return 'text-xs font-medium bg-obsidian-800 border-obsidian-700 text-zinc-300 px-2.5 py-1';
      case 2:
        return 'text-xs font-normal bg-obsidian-850 border-obsidian-750 text-zinc-400 px-2.5 py-0.5';
      default:
        return 'text-[11px] font-normal bg-obsidian-900 border-obsidian-800 text-zinc-500 px-2 py-0.5';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center p-3">
      {tags.map((tag) => (
        <button
          key={tag.text}
          type="button"
          onClick={() => onTagClick?.(tag.text)}
          className={`inline-flex items-center gap-1.5 rounded-xl border transition-all duration-150 hover:scale-105 hover:border-purple-400 hover:text-white ${getWeightClasses(
            tag.weight
          )}`}
        >
          <span>{tag.text}</span>
          <span className="text-[10px] opacity-60 font-mono">({tag.count})</span>
        </button>
      ))}
    </div>
  );
};
