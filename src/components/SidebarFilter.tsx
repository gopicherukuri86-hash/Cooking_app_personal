import React from 'react';
import { Filter, Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { DietaryRestriction, CookingDifficulty } from '../types';

interface SidebarFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dietaryFilters: DietaryRestriction[];
  setDietaryFilters: React.Dispatch<React.SetStateAction<DietaryRestriction[]>>;
  difficultyFilter: CookingDifficulty | 'All';
  setDifficultyFilter: (diff: CookingDifficulty | 'All') => void;
  maxTimeFilter: number; // in minutes, 0 means no limit
  setMaxTimeFilter: (mins: number) => void;
  sortBy: 'match' | 'time' | 'calories' | 'difficulty';
  setSortBy: (sort: 'match' | 'time' | 'calories' | 'difficulty') => void;
  onResetFilters: () => void;
}

const ALL_DIETARY_OPTIONS: DietaryRestriction[] = [
  'Vegetarian',
  'Vegan',
  'Keto',
  'Gluten-Free',
  'Dairy-Free',
  'Low Carb',
  'Nut-Free',
  'Paleo',
  'High Protein',
];

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  searchQuery,
  setSearchQuery,
  dietaryFilters,
  setDietaryFilters,
  difficultyFilter,
  setDifficultyFilter,
  maxTimeFilter,
  setMaxTimeFilter,
  sortBy,
  setSortBy,
  onResetFilters,
}) => {
  const toggleDietaryFilter = (tag: DietaryRestriction) => {
    setDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    dietaryFilters.length > 0 ||
    difficultyFilter !== 'All' ||
    maxTimeFilter !== 0;

  return (
    <aside className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-4">
        <h3 className="font-serif italic font-bold text-[#2D2D20] text-lg flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5A5A40]" />
          Filter Recipes
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-[#5A5A40] hover:text-[#2D2D20] font-bold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#333322] block">Search Dishes or Ingredients</label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E8E7A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. Gongura, Tamarind, Dal..."
            className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl pl-10 pr-3 py-2.5 text-xs text-[#2D2D20] placeholder-[#8E8E7A] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#333322] block">Dietary Preferences</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_DIETARY_OPTIONS.map((tag) => {
            const isSelected = dietaryFilters.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDietaryFilter(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#5A5A40] text-white font-bold shadow-xs'
                    : 'bg-[#F5F5F0] text-[#333322] border border-[#D1CEC0] hover:bg-[#E6E2D3]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Cooking Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#333322]">Max Cook Time</label>
          <span className="text-xs font-mono font-bold text-[#5A5A40]">
            {maxTimeFilter === 0 ? 'Any' : `< ${maxTimeFilter} mins`}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 15, 30, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => setMaxTimeFilter(mins)}
              className={`py-1.5 rounded-full text-xs font-semibold transition-all ${
                maxTimeFilter === mins
                  ? 'bg-[#5A5A40] text-white font-bold'
                  : 'bg-[#F5F5F0] text-[#333322] border border-[#D1CEC0] hover:bg-[#E6E2D3]'
              }`}
            >
              {mins === 0 ? 'Any' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#333322] block">Difficulty</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`py-1.5 rounded-full text-xs font-semibold transition-all ${
                difficultyFilter === diff
                  ? 'bg-[#5A5A40] text-white font-bold'
                  : 'bg-[#F5F5F0] text-[#333322] border border-[#D1CEC0] hover:bg-[#E6E2D3]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2 pt-2 border-t border-[#E6E2D3]">
        <label className="text-xs font-bold text-[#333322] flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A5A40]" /> Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2D2D20] focus:outline-none focus:border-[#5A5A40]"
        >
          <option value="match">Highest Ingredient Match %</option>
          <option value="time">Shortest Cooking Time</option>
          <option value="calories">Lowest Calories</option>
          <option value="difficulty">Ease of Preparation</option>
        </select>
      </div>
    </aside>
  );
};
