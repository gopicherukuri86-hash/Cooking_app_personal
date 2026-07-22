import React, { useState } from 'react';
import { Clock, Flame, ChefHat, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Sparkles, Heart, Leaf, Plus } from 'lucide-react';
import { Recipe, MissingIngredient, MealCategory } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  onAddMissingToShoppingList: (items: MissingIngredient[], recipeTitle: string) => void;
  isSaved?: boolean;
  onToggleSave?: (recipe: Recipe) => void;
  onLogToTracker?: (recipe: Recipe, category: MealCategory) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelectRecipe,
  onAddMissingToShoppingList,
  isSaved = false,
  onToggleSave,
  onLogToTracker,
}) => {
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const handleAddShopping = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
      onAddMissingToShoppingList(recipe.missingIngredients, recipe.title);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  const handleLogMeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLogToTracker) {
      const category: MealCategory = (recipe.mealType as MealCategory) || 'Lunch';
      onLogToTracker(recipe, category);
      setLoggedSuccess(true);
      setTimeout(() => setLoggedSuccess(false), 2500);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-[#F5F5F0] text-[#5A5A40] border-[#D1CEC0]';
      case 'Medium':
        return 'bg-[#F1EFE6] text-[#333322] border-[#5A5A40]/40';
      case 'Hard':
        return 'bg-[#2D2D20] text-white border-[#2D2D20]';
      default:
        return 'bg-[#F5F5F0] text-[#333322] border-[#D1CEC0]';
    }
  };

  return (
    <div
      onClick={() => onSelectRecipe(recipe)}
      className="bg-white border border-[#E6E2D3] hover:border-[#5A5A40] rounded-[32px] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
    >
      {/* Top Image Banner */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-[#F9F8F4]">
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Match Score & Sample Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="px-3 py-1 rounded-full bg-[#5A5A40] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#A3A375]" />
            <span>{recipe.matchScore || 95}% Match</span>
          </div>

          {recipe.isSample && (
            <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#5A5A40] border border-[#D1CEC0] text-[10px] font-bold shadow-sm tracking-wide uppercase">
              Sample
            </div>
          )}
        </div>

        {/* Favorite Save Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#333322] hover:text-rose-600 transition-colors shadow-md"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        )}

        {/* Cuisine & Style Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#333322] shadow-sm">
            {recipe.regionalStyle || recipe.cuisine || 'Telugu Cuisine'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif italic font-bold text-xl text-[#2D2D20] group-hover:text-[#5A5A40] transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-xs text-[#8E8E7A] line-clamp-2 mt-1.5 leading-relaxed font-medium">
            {recipe.description}
          </p>
        </div>

        {/* Healthy Substitute Callout for Wife (If present) */}
        {recipe.healthySubstitutes && recipe.healthySubstitutes.length > 0 && (
          <div className="p-3 bg-[#F1EFE6] border border-[#E6E2D3] rounded-2xl flex items-center gap-2.5">
            <Leaf className="w-4 h-4 text-[#5A5A40] flex-shrink-0" />
            <div className="text-[11px] text-[#333322] truncate">
              <span className="font-bold text-[#5A5A40]">Healthy Swap: </span>
              <span>{recipe.healthySubstitutes[0].substituteIngredient}</span>
              <span className="ml-1 text-[10px] font-bold text-[#A3A375] bg-white px-1.5 py-0.5 rounded-full border border-[#D1CEC0]">
                {recipe.healthySubstitutes[0].caloriesSaved}
              </span>
            </div>
          </div>
        )}

        {/* Quick Metrics Bar: Difficulty, Time, Calories */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E6E2D3] text-xs text-[#333322] font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>{recipe.totalTimeMinutes} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#A3A375]" />
            <span>{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F5F5F0] text-[#5A5A40] border border-[#D1CEC0]"
            >
              {tag}
            </span>
          ))}
          {recipe.dietaryTags.length > 3 && (
            <span className="px-2 py-1 rounded-full text-[10px] text-[#8E8E7A] bg-[#F5F5F0]">
              +{recipe.dietaryTags.length - 3}
            </span>
          )}
        </div>

        {/* Available vs Missing Ingredients Summary */}
        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex items-center justify-between text-[#333322]">
            <span className="flex items-center gap-1 text-[#5A5A40] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recipe.availableIngredients.length} ingredients ready
            </span>
            {recipe.missingIngredients.length > 0 ? (
              <span className="flex items-center gap-1 text-[#A3A375] font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                {recipe.missingIngredients.length} missing
              </span>
            ) : (
              <span className="text-[#5A5A40] font-bold">100% Stocked!</span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center gap-2">
          {onLogToTracker && (
            <button
              onClick={handleLogMeal}
              className={`py-2.5 px-3 rounded-full text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                loggedSuccess
                  ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                  : 'bg-[#F9F8F4] hover:bg-[#E6E2D3] text-[#333322] border-[#D1CEC0]'
              }`}
              title="Add calories & macros to Daily Tracker"
            >
              <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>{loggedSuccess ? 'Logged!' : '+ Log'}</span>
            </button>
          )}

          {recipe.missingIngredients.length > 0 && (
            <button
              onClick={handleAddShopping}
              className={`py-2.5 px-3 rounded-full text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                addedSuccess
                  ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                  : 'bg-[#F5F5F0] hover:bg-[#E6E2D3] text-[#333322] border-[#D1CEC0]'
              }`}
              title="Add missing ingredients to shopping list"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>{addedSuccess ? 'Added!' : `+ Missing`}</span>
            </button>
          )}

          <button
            onClick={() => onSelectRecipe(recipe)}
            className="flex-1 py-2.5 px-3 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold rounded-full text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Cook Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
