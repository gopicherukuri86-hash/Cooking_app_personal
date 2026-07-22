import React from 'react';
import { ChefHat, Camera, UtensilsCrossed, ShoppingBag, Sparkles, BookOpen, Search, Flame, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scan' | 'recipes' | 'cooking' | 'shopping' | 'nutrition';
  setActiveTab: (tab: 'scan' | 'recipes' | 'cooking' | 'shopping' | 'nutrition') => void;
  shoppingListCount: number;
  detectedIngredientsCount: number;
  hasActiveRecipe: boolean;
  activeRecipeTitle?: string;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  shoppingListCount,
  detectedIngredientsCount,
  hasActiveRecipe,
  activeRecipeTitle,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E2D3] text-[#333322] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('scan')}
          >
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-sm group-hover:bg-[#4A4A35] transition-all">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif italic font-bold tracking-tight text-[#5A5A40]">
                  CulinaryAI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F5F5F0] text-[#8E8E7A] border border-[#D1CEC0]">
                  <Sparkles className="w-3 h-3 text-[#5A5A40]" /> Private Kitchen
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E7A] font-medium hidden sm:block">Telugu & Global Cuisine • Diet Assistant</p>
            </div>
          </div>

          {/* Center Tab Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                  : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Dish & Fridge AI</span>
              {detectedIngredientsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                  {detectedIngredientsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                  : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Recipes</span>
            </button>

            {hasActiveRecipe && (
              <button
                onClick={() => setActiveTab('cooking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'cooking'
                    ? 'bg-[#2D2D20] text-white font-semibold shadow-md'
                    : 'text-[#5A5A40] bg-[#F1EFE6] border border-[#5A5A40]/30 hover:bg-[#E6E2D3]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#A3A375] animate-pulse" />
                <span className="hidden md:inline">Cooking Studio</span>
                <span className="md:hidden">Cook</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('shopping')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                  : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Grocery</span> List
              {shoppingListCount > 0 && (
                <span className="ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A3A375] text-white">
                  {shoppingListCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'nutrition'
                  ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                  : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Nutrition & Calories</span>
              <span className="sm:hidden">Tracker</span>
            </button>
          </nav>

          {/* Right Status Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E6E2D3] shadow-xs">
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-[#5A5A40] animate-pulse' : 'bg-[#8E8E7A]'}`} />
              <span className="text-[#5A5A40] font-medium">
                {hasApiKey ? 'Gemini 3.6 Connected' : 'Demo Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
