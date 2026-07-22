import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Settings,
  X,
  PieChart as PieChartIcon,
  Sparkles,
  Utensils,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Heart,
  RotateCcw
} from 'lucide-react';
import {
  Recipe,
  LoggedMealItem,
  DailyNutritionGoals,
  MealCategory,
} from '../types';

interface NutritionDashboardProps {
  loggedMeals: LoggedMealItem[];
  goals: DailyNutritionGoals;
  onUpdateGoals: (newGoals: DailyNutritionGoals) => void;
  onRemoveMeal: (mealId: string) => void;
  onUpdateServings: (mealId: string, newServings: number) => void;
  onAddCustomMeal: (meal: Omit<LoggedMealItem, 'id' | 'loggedAt'>) => void;
  onClearAllMeals: () => void;
  onNavigateToRecipes: () => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  loggedMeals,
  goals,
  onUpdateGoals,
  onRemoveMeal,
  onUpdateServings,
  onAddCustomMeal,
  onClearAllMeals,
  onNavigateToRecipes,
}) => {
  // Modal states
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showCustomEntryModal, setShowCustomEntryModal] = useState(false);

  // Edit Goals Local Form State
  const [tempGoals, setTempGoals] = useState<DailyNutritionGoals>(goals);

  // Quick Custom Entry Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<MealCategory>('Lunch');
  const [customCalories, setCustomCalories] = useState('250');
  const [customProtein, setCustomProtein] = useState('15');
  const [customCarbs, setCustomCarbs] = useState('30');
  const [customFat, setCustomFat] = useState('8');
  const [customFiber, setCustomFiber] = useState('5');

  // Calculate totals from logged meals
  const totalCalories = loggedMeals.reduce((acc, item) => acc + item.calories * item.servings, 0);
  const totalProtein = loggedMeals.reduce((acc, item) => acc + item.proteinGrams * item.servings, 0);
  const totalCarbs = loggedMeals.reduce((acc, item) => acc + item.carbsGrams * item.servings, 0);
  const totalFat = loggedMeals.reduce((acc, item) => acc + item.fatGrams * item.servings, 0);
  const totalFiber = loggedMeals.reduce((acc, item) => acc + item.fiberGrams * item.servings, 0);

  const totalIron = loggedMeals.reduce((acc, item) => acc + (item.ironMg || 0) * item.servings, 0);
  const totalCalcium = loggedMeals.reduce((acc, item) => acc + (item.calciumMg || 0) * item.servings, 0);
  const totalVitaminC = loggedMeals.reduce((acc, item) => acc + (item.vitaminCMg || 0) * item.servings, 0);
  const totalPotassium = loggedMeals.reduce((acc, item) => acc + (item.potassiumMg || 0) * item.servings, 0);
  const totalSodium = loggedMeals.reduce((acc, item) => acc + (item.sodiumMg || 0) * item.servings, 0);

  // Remaining calories calculation
  const remainingCalories = goals.calories - totalCalories;
  const caloriePercent = Math.min(Math.round((totalCalories / goals.calories) * 100), 100);

  // Macro Energy Ratios (Protein 4kcal/g, Carbs 4kcal/g, Fat 9kcal/g)
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinRatio = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsRatio = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatRatio = Math.round((fatKcal / totalMacroKcal) * 100);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(tempGoals);
    setShowGoalsModal(false);
  };

  const handleCreateCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAddCustomMeal({
      title: customTitle.trim(),
      mealCategory: customCategory,
      servings: 1,
      calories: Number(customCalories) || 0,
      proteinGrams: Number(customProtein) || 0,
      carbsGrams: Number(customCarbs) || 0,
      fatGrams: Number(customFat) || 0,
      fiberGrams: Number(customFiber) || 0,
      ironMg: 2.0,
      calciumMg: 100,
      vitaminCMg: 15,
      potassiumMg: 300,
      sodiumMg: 250,
    });

    setCustomTitle('');
    setShowCustomEntryModal(false);
  };

  const MEAL_CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header Controls */}
      <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F0] text-[#5A5A40] border border-[#D1CEC0]">
            <Activity className="w-3.5 h-3.5 text-[#5A5A40]" /> Daily Nutrition & Calorie Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2D2D20]">
            Nutritional Balance Summary
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E7A] font-medium">
            Monitor daily calorie burn budget, macronutrient intake, and essential micronutrients.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCustomEntryModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#F5F5F0] hover:bg-[#E6E2D3] text-[#333322] border border-[#D1CEC0] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#5A5A40]" />
            <span>Quick Food Log</span>
          </button>

          <button
            onClick={() => {
              setTempGoals(goals);
              setShowGoalsModal(true);
            }}
            className="px-4 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Settings className="w-4 h-4 text-white" />
            <span>Set Daily Goals</span>
          </button>
        </div>
      </div>

      {/* Main Calorie Ring & Hero Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calorie Progress Arc & Remaining Callout (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E6E2D3] rounded-[32px] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#5A5A40]" />
              <h2 className="font-serif italic font-bold text-lg text-[#2D2D20]">Daily Calorie Gauge</h2>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E7A] bg-[#F5F5F0] px-3 py-1 rounded-full border border-[#D1CEC0]">
              Goal: {goals.calories} kcal
            </span>
          </div>

          {/* Large Circular Visual Progress */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-[#E6E2D3]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Foreground Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-[#5A5A40] transition-all duration-700 ease-out"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - caloriePercent / 100)}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Ring Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-[#2D2D20] font-mono">
                {totalCalories}
              </span>
              <span className="text-xs font-bold text-[#8E8E7A] uppercase tracking-wider">
                kcal Consumed
              </span>
              <span className="text-[11px] font-semibold text-[#5A5A40] mt-1 bg-[#F5F5F0] px-2.5 py-0.5 rounded-full border border-[#D1CEC0]">
                {caloriePercent}% of goal
              </span>
            </div>
          </div>

          {/* Remaining Calorie Box */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8E8E7A] font-bold block uppercase tracking-wider">Budget Remaining</span>
              <span className={`text-xl font-bold font-mono ${remainingCalories >= 0 ? 'text-[#2D2D20]' : 'text-rose-600'}`}>
                {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `${Math.abs(remainingCalories)} kcal over`}
              </span>
            </div>
            <div className={`p-2.5 rounded-full ${remainingCalories >= 0 ? 'bg-[#5A5A40] text-white' : 'bg-rose-100 text-rose-700'}`}>
              {remainingCalories >= 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Macros Summary Cards (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E6E2D3] rounded-[32px] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif italic font-bold text-lg text-[#2D2D20] flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#5A5A40]" /> Daily Macronutrient Goals
            </h2>
            <span className="text-xs text-[#8E8E7A] font-medium">Protein • Carbs • Fat • Fiber</span>
          </div>

          {/* 4 Macro Progress Bars Grid */}
          <div className="space-y-5">
            {/* Protein */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#333322]">Protein (g)</span>
                <span className="text-[#5A5A40] font-mono">
                  {totalProtein}g / {goals.proteinGrams}g ({Math.round((totalProtein / goals.proteinGrams) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#E6E2D3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5A5A40] transition-all duration-500"
                  style={{ width: `${Math.min((totalProtein / goals.proteinGrams) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#333322]">Carbohydrates (g)</span>
                <span className="text-[#5A5A40] font-mono">
                  {totalCarbs}g / {goals.carbsGrams}g ({Math.round((totalCarbs / goals.carbsGrams) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#E6E2D3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8E8E7A] transition-all duration-500"
                  style={{ width: `${Math.min((totalCarbs / goals.carbsGrams) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Healthy Fats */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#333322]">Fats (g)</span>
                <span className="text-[#5A5A40] font-mono">
                  {totalFat}g / {goals.fatGrams}g ({Math.round((totalFat / goals.fatGrams) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#E6E2D3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A3A375] transition-all duration-500"
                  style={{ width: `${Math.min((totalFat / goals.fatGrams) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Dietary Fiber */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#333322]">Dietary Fiber (g)</span>
                <span className="text-[#5A5A40] font-mono">
                  {totalFiber}g / {goals.fiberGrams}g ({Math.round((totalFiber / goals.fiberGrams) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#E6E2D3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D2D20] transition-all duration-500"
                  style={{ width: `${Math.min((totalFiber / goals.fiberGrams) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Macro Energy Ratio Bar */}
          <div className="pt-4 border-t border-[#E6E2D3] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E7A] block">Macro Calorie Split Ratio</span>
            <div className="h-3 w-full rounded-full flex overflow-hidden border border-[#D1CEC0]">
              <div style={{ width: `${proteinRatio}%` }} className="bg-[#5A5A40]" title={`Protein: ${proteinRatio}%`} />
              <div style={{ width: `${carbsRatio}%` }} className="bg-[#8E8E7A]" title={`Carbs: ${carbsRatio}%`} />
              <div style={{ width: `${fatRatio}%` }} className="bg-[#A3A375]" title={`Fat: ${fatRatio}%`} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#5A5A40]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5A5A40]" /> Protein {proteinRatio}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8E8E7A]" /> Carbs {carbsRatio}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A3A375]" /> Fat {fatRatio}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Micronutrients Summary Dashboard Grid */}
      <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif italic font-bold text-xl text-[#2D2D20] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5A5A40]" /> Essential Micronutrient Breakdown
            </h2>
            <p className="text-xs text-[#8E8E7A] font-medium mt-0.5">
              Tracks iron, calcium, vitamin C, potassium, and sodium from selected recipes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Iron */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#333322]">
              <span>Iron (Fe)</span>
              <span className="font-mono text-[#5A5A40]">{totalIron.toFixed(1)} / {goals.ironMg} mg</span>
            </div>
            <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
              <div className="h-full bg-[#5A5A40]" style={{ width: `${Math.min((totalIron / goals.ironMg) * 100, 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#8E8E7A] font-medium block">Essential for hemoglobin & stamina</span>
          </div>

          {/* Calcium */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#333322]">
              <span>Calcium (Ca)</span>
              <span className="font-mono text-[#5A5A40]">{Math.round(totalCalcium)} / {goals.calciumMg} mg</span>
            </div>
            <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
              <div className="h-full bg-[#5A5A40]" style={{ width: `${Math.min((totalCalcium / goals.calciumMg) * 100, 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#8E8E7A] font-medium block">Supports bone density & muscular health</span>
          </div>

          {/* Vitamin C */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#333322]">
              <span>Vitamin C</span>
              <span className="font-mono text-[#5A5A40]">{Math.round(totalVitaminC)} / {goals.vitaminCMg} mg</span>
            </div>
            <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
              <div className="h-full bg-[#5A5A40]" style={{ width: `${Math.min((totalVitaminC / goals.vitaminCMg) * 100, 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#8E8E7A] font-medium block">Boosts immunity & collagen synth</span>
          </div>

          {/* Potassium */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#333322]">
              <span>Potassium (K)</span>
              <span className="font-mono text-[#5A5A40]">{Math.round(totalPotassium)} / {goals.potassiumMg} mg</span>
            </div>
            <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
              <div className="h-full bg-[#5A5A40]" style={{ width: `${Math.min((totalPotassium / goals.potassiumMg) * 100, 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#8E8E7A] font-medium block">Electrolyte balance & cardiovascular regulation</span>
          </div>

          {/* Sodium */}
          <div className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#333322]">
              <span>Sodium (Na)</span>
              <span className="font-mono text-[#5A5A40]">{Math.round(totalSodium)} / {goals.sodiumMg} mg</span>
            </div>
            <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
              <div className="h-full bg-[#2D2D20]" style={{ width: `${Math.min((totalSodium / goals.sodiumMg) * 100, 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#8E8E7A] font-medium block">Target limit: {goals.sodiumMg} mg max</span>
          </div>
        </div>
      </div>

      {/* Today's Meal Log Section (Categorized into Breakfast, Lunch, Dinner, Snacks) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#2D2D20]">Today's Food & Meal Log</h2>
            <p className="text-xs text-[#8E8E7A] font-medium">Logged dishes directly update your calorie & macro progress.</p>
          </div>

          {loggedMeals.length > 0 && (
            <button
              onClick={onClearAllMeals}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Today's Log
            </button>
          )}
        </div>

        {/* Meal Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MEAL_CATEGORIES.map((category) => {
            const categoryMeals = loggedMeals.filter((m) => m.mealCategory === category);
            const categoryCalories = categoryMeals.reduce((acc, m) => acc + m.calories * m.servings, 0);

            return (
              <div key={category} className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-3">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#5A5A40]" />
                      <h3 className="font-serif italic font-bold text-lg text-[#2D2D20]">{category}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F5F0] px-3 py-1 rounded-full border border-[#D1CEC0]">
                      {categoryCalories} kcal
                    </span>
                  </div>

                  {categoryMeals.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {categoryMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="p-4 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-sm text-[#2D2D20] block line-clamp-1">{meal.title}</span>
                            <div className="flex items-center gap-2 text-[11px] text-[#8E8E7A]">
                              <span className="font-bold text-[#5A5A40]">{meal.calories * meal.servings} kcal</span>
                              <span>•</span>
                              <span>{meal.proteinGrams * meal.servings}g Protein</span>
                              <span>•</span>
                              <span>{meal.carbsGrams * meal.servings}g Carbs</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Servings Adjuster */}
                            <div className="flex items-center bg-white border border-[#D1CEC0] rounded-full px-2 py-0.5 text-xs font-bold text-[#333322]">
                              <button
                                onClick={() => onUpdateServings(meal.id, Math.max(0.5, meal.servings - 0.5))}
                                className="px-1 text-[#8E8E7A] hover:text-[#2D2D20]"
                              >
                                -
                              </button>
                              <span className="px-1 font-mono">{meal.servings}x</span>
                              <button
                                onClick={() => onUpdateServings(meal.id, meal.servings + 0.5)}
                                className="px-1 text-[#8E8E7A] hover:text-[#2D2D20]"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveMeal(meal.id)}
                              className="text-[#8E8E7A] hover:text-rose-600 transition-colors p-1"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-xs text-[#8E8E7A]">No meals logged for {category}</p>
                      <button
                        onClick={onNavigateToRecipes}
                        className="text-xs font-bold text-[#5A5A40] hover:underline inline-flex items-center gap-1"
                      >
                        Browse Recipes <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setCustomCategory(category);
                    setShowCustomEntryModal(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#F5F5F0] hover:bg-[#E6E2D3] border border-[#D1CEC0] text-xs font-bold text-[#333322] flex items-center justify-center gap-1.5 transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#5A5A40]" /> + Quick Add to {category}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT GOALS MODAL */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowGoalsModal(false)}
              className="absolute top-6 right-6 text-[#8E8E7A] hover:text-[#2D2D20]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="font-serif italic font-bold text-2xl text-[#2D2D20]">Set Daily Nutrition Targets</h2>
              <p className="text-xs text-[#8E8E7A]">Customize your daily calorie budget and target macros.</p>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Daily Calories (kcal)</label>
                  <input
                    type="number"
                    value={tempGoals.calories}
                    onChange={(e) => setTempGoals({ ...tempGoals, calories: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Target Protein (g)</label>
                  <input
                    type="number"
                    value={tempGoals.proteinGrams}
                    onChange={(e) => setTempGoals({ ...tempGoals, proteinGrams: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Target Carbs (g)</label>
                  <input
                    type="number"
                    value={tempGoals.carbsGrams}
                    onChange={(e) => setTempGoals({ ...tempGoals, carbsGrams: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Target Fat (g)</label>
                  <input
                    type="number"
                    value={tempGoals.fatGrams}
                    onChange={(e) => setTempGoals({ ...tempGoals, fatGrams: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Target Fiber (g)</label>
                  <input
                    type="number"
                    value={tempGoals.fiberGrams}
                    onChange={(e) => setTempGoals({ ...tempGoals, fiberGrams: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Sodium Limit (mg)</label>
                  <input
                    type="number"
                    value={tempGoals.sodiumMg}
                    onChange={(e) => setTempGoals({ ...tempGoals, sodiumMg: Number(e.target.value) })}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm font-bold text-[#2D2D20]"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F5F5F0] text-[#333322] font-bold border border-[#D1CEC0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#5A5A40] text-white font-bold hover:bg-[#4A4A35]"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CUSTOM ENTRY MODAL */}
      {showCustomEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowCustomEntryModal(false)}
              className="absolute top-6 right-6 text-[#8E8E7A] hover:text-[#2D2D20]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="font-serif italic font-bold text-2xl text-[#2D2D20]">Log Quick Food Item</h2>
              <p className="text-xs text-[#8E8E7A]">Add custom food, smoothie, or snack directly to your tracker.</p>
            </div>

            <form onSubmit={handleCreateCustomMeal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#333322] block">Food or Snack Title</label>
                <input
                  type="text"
                  placeholder="e.g. Protein Smoothie, Apple & Almonds..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2.5 text-sm text-[#2D2D20]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#333322] block">Meal Slot</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as MealCategory)}
                  className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2.5 text-sm text-[#2D2D20]"
                >
                  {MEAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm text-[#2D2D20]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm text-[#2D2D20]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm text-[#2D2D20]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#333322] block">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-3.5 py-2 text-sm text-[#2D2D20]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomEntryModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F5F5F0] text-[#333322] font-bold border border-[#D1CEC0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#5A5A40] text-white font-bold hover:bg-[#4A4A35]"
                >
                  Log Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
