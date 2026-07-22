import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FridgeScanner } from './components/FridgeScanner';
import { SidebarFilter } from './components/SidebarFilter';
import { RecipeCard } from './components/RecipeCard';
import { CookingStudioModal } from './components/CookingStudioModal';
import { ShoppingListTab } from './components/ShoppingListTab';
import { NutritionDashboard } from './components/NutritionDashboard';
import { SAMPLE_FRIDGES } from './data/sampleData';
import {
  Recipe,
  IngredientItem,
  ShoppingListItem,
  DietaryRestriction,
  CookingDifficulty,
  MissingIngredient,
  AnalyzeFridgeRequest,
  AnalyzeFridgeResponse,
  LoggedMealItem,
  DailyNutritionGoals,
  MealCategory,
} from './types';
import { Sparkles, UtensilsCrossed, RefreshCw, ChefHat, Check, Heart, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'recipes' | 'cooking' | 'shopping' | 'nutrition'>('scan');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Daily Nutrition Goals state
  const [nutritionGoals, setNutritionGoals] = useState<DailyNutritionGoals>(() => {
    const saved = localStorage.getItem('culinary_nutrition_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      calories: 2000,
      proteinGrams: 120,
      carbsGrams: 225,
      fatGrams: 65,
      fiberGrams: 30,
      ironMg: 18,
      calciumMg: 1000,
      vitaminCMg: 90,
      potassiumMg: 3500,
      sodiumMg: 2000,
    };
  });

  // Logged Meals state
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealItem[]>(() => {
    const saved = localStorage.getItem('culinary_logged_meals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'log_1',
        recipeId: 'rec-pesarattu-upma',
        title: 'Protein-Rich Andhra Pesarattu',
        mealCategory: 'Breakfast',
        servings: 1,
        calories: 240,
        proteinGrams: 16,
        carbsGrams: 34,
        fatGrams: 4,
        fiberGrams: 8,
        ironMg: 5.1,
        calciumMg: 110,
        vitaminCMg: 14,
        potassiumMg: 480,
        sodiumMg: 280,
        loggedAt: new Date().toISOString(),
      },
      {
        id: 'log_2',
        recipeId: 'rec-andhra-pappu-charu',
        title: 'Andhra Tomato Pappu Charu',
        mealCategory: 'Lunch',
        servings: 1,
        calories: 210,
        proteinGrams: 14,
        carbsGrams: 32,
        fatGrams: 4,
        fiberGrams: 7,
        ironMg: 4.2,
        calciumMg: 85,
        vitaminCMg: 24,
        potassiumMg: 510,
        sodiumMg: 420,
        loggedAt: new Date().toISOString(),
      },
    ];
  });

  // Ingredients detected from fridge scan
  const [detectedIngredients, setDetectedIngredients] = useState<IngredientItem[]>(
    SAMPLE_FRIDGES[0].presetIngredients
  );

  // Generated recipes list
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_FRIDGES[0].defaultRecipes);

  // Active selected recipe for cooking mode
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Shopping list items
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const saved = localStorage.getItem('culinary_shopping_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'shop_1',
        name: 'Tamarind Paste',
        amount: '2 tbsp',
        category: 'Pantry',
        recipeSource: 'Authentic Andhra Gongura Pappu',
        completed: false,
        addedAt: new Date().toLocaleDateString(),
      },
      {
        id: 'shop_2',
        name: 'Fresh Curry Leaves',
        amount: '1 bunch',
        category: 'Produce',
        recipeSource: 'Telangana Style Natu Kodi Kura',
        completed: false,
        addedAt: new Date().toLocaleDateString(),
      },
    ];
  });

  // Saved/favorite recipe IDs
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('culinary_saved_recipe_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Persist goals, logged meals, shopping list, and saved recipes
  useEffect(() => {
    localStorage.setItem('culinary_nutrition_goals', JSON.stringify(nutritionGoals));
  }, [nutritionGoals]);

  useEffect(() => {
    localStorage.setItem('culinary_logged_meals', JSON.stringify(loggedMeals));
  }, [loggedMeals]);

  useEffect(() => {
    localStorage.setItem('culinary_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('culinary_saved_recipe_ids', JSON.stringify(savedRecipeIds));
  }, [savedRecipeIds]);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryRestriction[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<CookingDifficulty | 'All'>('All');
  const [maxTimeFilter, setMaxTimeFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'time' | 'calories' | 'difficulty'>('match');

  // Check health status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => setHasApiKey(false));
  }, []);

  // Handle Fridge Analysis
  const handleAnalyzeFridge = async (payload: AnalyzeFridgeRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze fridge image');
      }

      const data: AnalyzeFridgeResponse = await response.json();
      if (data.detectedIngredients && data.detectedIngredients.length > 0) {
        setDetectedIngredients(data.detectedIngredients);
      }
      if (data.suggestedRecipes && data.suggestedRecipes.length > 0) {
        setRecipes(data.suggestedRecipes);
      }
    } catch (err) {
      console.error('Error analyzing fridge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add missing items to shopping list
  const handleAddMissingToShoppingList = (missingItems: MissingIngredient[], recipeTitle: string) => {
    setShoppingList((prev) => {
      const existingNames = new Set(prev.map((i) => i.name.toLowerCase()));
      const newEntries: ShoppingListItem[] = [];

      missingItems.forEach((m) => {
        if (!existingNames.has(m.name.toLowerCase())) {
          newEntries.push({
            id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: m.name,
            amount: m.amount,
            category: m.category,
            recipeSource: recipeTitle,
            completed: false,
            addedAt: new Date().toLocaleDateString(),
          });
        }
      });

      return [...prev, ...newEntries];
    });
  };

  // Toggle favorite recipe
  const handleToggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipeIds((prev) =>
      prev.includes(recipe.id) ? prev.filter((id) => id !== recipe.id) : [...prev, recipe.id]
    );
  };

  // Nutrition Tracker Handlers
  const handleLogRecipeToTracker = (recipe: Recipe, category: MealCategory = 'Lunch') => {
    const pGrams = parseFloat((recipe.nutritionalFacts?.protein || '0').replace(/[^0-9.]/g, '')) || 15;
    const cGrams = parseFloat((recipe.nutritionalFacts?.carbs || '0').replace(/[^0-9.]/g, '')) || 25;
    const fGrams = parseFloat((recipe.nutritionalFacts?.fat || '0').replace(/[^0-9.]/g, '')) || 10;
    const fibGrams = parseFloat((recipe.nutritionalFacts?.fiber || '0').replace(/[^0-9.]/g, '')) || 5;

    const micros = recipe.nutritionalFacts?.micronutrients || {};

    const newMeal: LoggedMealItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipeId: recipe.id,
      title: recipe.title,
      mealCategory: category,
      servings: 1,
      calories: recipe.calories || 250,
      proteinGrams: pGrams,
      carbsGrams: cGrams,
      fatGrams: fGrams,
      fiberGrams: fibGrams,
      ironMg: micros.ironMg ?? 3.5,
      calciumMg: micros.calciumMg ?? 120,
      vitaminCMg: micros.vitaminCMg ?? 20,
      potassiumMg: micros.potassiumMg ?? 400,
      sodiumMg: micros.sodiumMg ?? 350,
      loggedAt: new Date().toISOString(),
    };

    setLoggedMeals((prev) => [newMeal, ...prev]);
  };

  const handleRemoveMeal = (mealId: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleUpdateServings = (mealId: string, newServings: number) => {
    setLoggedMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, servings: newServings } : m))
    );
  };

  const handleAddCustomMeal = (customData: Omit<LoggedMealItem, 'id' | 'loggedAt'>) => {
    const newMeal: LoggedMealItem = {
      ...customData,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      loggedAt: new Date().toISOString(),
    };
    setLoggedMeals((prev) => [newMeal, ...prev]);
  };

  const handleClearAllMeals = () => {
    setLoggedMeals([]);
  };

  // Filter & Sort Recipes Calculation
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((recipe) => {
        // Search Query
        if (
          searchQuery.trim() &&
          !recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Dietary Filters (Must match ALL selected tags)
        if (
          dietaryFilters.length > 0 &&
          !dietaryFilters.every((tag) => recipe.dietaryTags.includes(tag))
        ) {
          return false;
        }

        // Difficulty Filter
        if (difficultyFilter !== 'All' && recipe.difficulty !== difficultyFilter) {
          return false;
        }

        // Max Cooking Time
        if (maxTimeFilter > 0 && recipe.totalTimeMinutes > maxTimeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'time') return a.totalTimeMinutes - b.totalTimeMinutes;
        if (sortBy === 'calories') return a.calories - b.calories;
        if (sortBy === 'difficulty') {
          const diffMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
          return (diffMap[a.difficulty] || 1) - (diffMap[b.difficulty] || 1);
        }
        return 0;
      });
  }, [recipes, searchQuery, dietaryFilters, difficultyFilter, maxTimeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#333322] font-sans flex flex-col selection:bg-[#5A5A40] selection:text-white">
      {/* Sticky Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shoppingListCount={shoppingList.filter((i) => !i.completed).length}
        detectedIngredientsCount={detectedIngredients.length}
        hasActiveRecipe={Boolean(selectedRecipe)}
        activeRecipeTitle={selectedRecipe?.title}
        hasApiKey={hasApiKey}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {/* Tab 1: Direct Dish AI & Fridge Scan */}
        {activeTab === 'scan' && (
          <FridgeScanner
            onAnalyze={handleAnalyzeFridge}
            detectedIngredients={detectedIngredients}
            setDetectedIngredients={setDetectedIngredients}
            isLoading={isLoading}
            onNavigateToRecipes={() => setActiveTab('recipes')}
            dietaryPreferences={dietaryFilters}
            setDietaryPreferences={setDietaryFilters}
          />
        )}

        {/* Tab 2: Recipe Discovery Grid & Sidebar Filter */}
        {activeTab === 'recipes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top Discovery Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E6E2D3] rounded-[32px] p-6 shadow-xs">
              <div>
                <h1 className="text-2xl font-serif italic font-bold text-[#2D2D20] flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6 text-[#5A5A40]" />
                  Suggested AI Culinary Recipes
                </h1>
                <p className="text-xs sm:text-sm text-[#8E8E7A] font-medium mt-1">
                  Custom-tailored recipes with diet-conscious substitutes for your home
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="px-4 py-2.5 bg-[#F5F5F0] hover:bg-[#E6E2D3] text-[#333322] text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 border border-[#D1CEC0]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#5A5A40]" /> New Recipe / Search
                </button>
              </div>
            </div>

            {/* Main Grid + Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Sidebar Filters (4 cols) */}
              <div className="lg:col-span-4">
                <SidebarFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  dietaryFilters={dietaryFilters}
                  setDietaryFilters={setDietaryFilters}
                  difficultyFilter={difficultyFilter}
                  setDifficultyFilter={setDifficultyFilter}
                  maxTimeFilter={maxTimeFilter}
                  setMaxTimeFilter={setMaxTimeFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setDietaryFilters([]);
                    setDifficultyFilter('All');
                    setMaxTimeFilter(0);
                    setSortBy('match');
                  }}
                />
              </div>

              {/* Right Recipe Cards Grid (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between text-xs text-[#8E8E7A] font-medium">
                  <span>Showing {filteredRecipes.length} of {recipes.length} recipes</span>
                  {dietaryFilters.length > 0 && (
                    <span className="text-[#5A5A40] font-bold">
                      Filtered for: {dietaryFilters.join(', ')}
                    </span>
                  )}
                </div>

                {filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onSelectRecipe={(r) => {
                          setSelectedRecipe(r);
                          setActiveTab('cooking');
                        }}
                        onAddMissingToShoppingList={handleAddMissingToShoppingList}
                        isSaved={savedRecipeIds.includes(recipe.id)}
                        onToggleSave={handleToggleSaveRecipe}
                        onLogToTracker={handleLogRecipeToTracker}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-[#E6E2D3] rounded-[32px] space-y-4">
                    <UtensilsCrossed className="w-12 h-12 text-[#8E8E7A] mx-auto" />
                    <h3 className="text-lg font-serif italic font-bold text-[#2D2D20]">No matching recipes found</h3>
                    <p className="text-xs text-[#8E8E7A] max-w-sm mx-auto">
                      Try adjusting your search query or dietary filters to display more recipes.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDietaryFilters([]);
                        setDifficultyFilter('All');
                        setMaxTimeFilter(0);
                      }}
                      className="px-5 py-2.5 bg-[#5A5A40] text-white font-bold rounded-full text-xs hover:bg-[#4A4A35]"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Step-by-Step Cooking Studio */}
        {activeTab === 'cooking' && selectedRecipe && (
          <CookingStudioModal
            recipe={selectedRecipe}
            onClose={() => setActiveTab('recipes')}
            onAddMissingToShoppingList={handleAddMissingToShoppingList}
            onLogToTracker={handleLogRecipeToTracker}
          />
        )}

        {/* Tab 4: Shopping List */}
        {activeTab === 'shopping' && (
          <ShoppingListTab items={shoppingList} setItems={setShoppingList} />
        )}

        {/* Tab 5: Nutrition & Calorie Tracker Summary Dashboard */}
        {activeTab === 'nutrition' && (
          <NutritionDashboard
            loggedMeals={loggedMeals}
            goals={nutritionGoals}
            onUpdateGoals={setNutritionGoals}
            onRemoveMeal={handleRemoveMeal}
            onUpdateServings={handleUpdateServings}
            onAddCustomMeal={handleAddCustomMeal}
            onClearAllMeals={handleClearAllMeals}
            onNavigateToRecipes={() => setActiveTab('recipes')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E2D3] bg-white py-6 text-center text-xs text-[#8E8E7A]">
        <p>Smart Culinary Assistant & Recipe Studio • Authentic Telugu & World Cuisine AI</p>
      </footer>
    </div>
  );
}
