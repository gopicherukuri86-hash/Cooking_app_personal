export type IngredientCategory =
  | 'Produce'
  | 'Protein'
  | 'Dairy'
  | 'Pantry'
  | 'Spices'
  | 'Grains'
  | 'Beverages'
  | 'Other';

export interface IngredientSubstituteSuggestion {
  alternativeName: string;
  type: 'Healthy' | 'Pantry' | 'Low Calorie';
  reason: string;
  caloriesSaved?: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity?: string;
  freshness?: 'Fresh' | 'Use Soon' | 'Frozen' | 'Pantry Item';
  confidence?: number;
  suggestedSubstitute?: IngredientSubstituteSuggestion;
  isMissingOrLow?: boolean;
}

export type DietaryRestriction =
  | 'Vegetarian'
  | 'Vegan'
  | 'Keto'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Low Carb'
  | 'Nut-Free'
  | 'Paleo'
  | 'High Protein'
  | 'Low Calorie';

export type CookingDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface MissingIngredient {
  name: string;
  amount: string;
  category: IngredientCategory;
  estimatedCost?: string;
}

export interface HealthySubstitute {
  originalIngredient: string;
  substituteIngredient: string;
  caloriesSaved: string; // e.g., "Saved ~120 kcal"
  healthBenefit: string; // e.g., "Low glycemic index, rich in fiber"
  cookingAdjustment?: string; // e.g., "Air-fry at 375°F instead of deep frying"
}

export interface CookingStep {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes?: number;
  tip?: string;
  technique?: string;
  ingredientsUsed?: string[];
}

export interface Micronutrients {
  ironMg?: number;
  calciumMg?: number;
  vitaminCMg?: number;
  potassiumMg?: number;
  sodiumMg?: number;
}

export interface NutritionalFacts {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  micronutrients?: Micronutrients;
}

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface LoggedMealItem {
  id: string;
  recipeId?: string;
  title: string;
  mealCategory: MealCategory;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  ironMg: number;
  calciumMg: number;
  vitaminCMg: number;
  potassiumMg: number;
  sodiumMg: number;
  loggedAt: string;
}

export interface DailyNutritionGoals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  ironMg: number;
  calciumMg: number;
  vitaminCMg: number;
  potassiumMg: number;
  sodiumMg: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  prepTime: string;
  cookTime: string;
  totalTimeMinutes: number;
  calories: number;
  difficulty: CookingDifficulty;
  servings: number;
  cuisine: string;
  regionalStyle?: string; // e.g. 'Telugu / Andhra', 'South Indian', 'North Indian', 'Mediterranean', 'Global'
  matchScore: number; // 0 to 100 percentage
  dietaryTags: DietaryRestriction[];
  mealType: string;
  availableIngredients: string[];
  missingIngredients: MissingIngredient[];
  healthySubstitutes?: HealthySubstitute[];
  chefTip?: string;
  nutritionalFacts: NutritionalFacts;
  steps: CookingStep[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  category: IngredientCategory;
  recipeSource?: string;
  estimatedCost?: string;
  completed: boolean;
  addedAt: string;
}

export interface SampleFridge {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  presetIngredients: IngredientItem[];
  defaultRecipes: Recipe[];
}

export interface AnalyzeFridgeRequest {
  image?: string; // base64 string
  sampleId?: string;
  manualIngredients?: string[];
  directDishQuery?: string; // Allow searching for a dish directly by name (e.g. "Gutti Vankaya Kura", "Paneer Butter Masala")
  regionalCuisineStyle?: string; // 'Telugu / Andhra', 'South Indian', 'North Indian', 'Pan-Indian', 'Global'
  healthyDietFocus?: boolean; // Prioritize low-calorie & healthy substitutes for wife
  momsSecretTweak?: string; // Mom's traditional recipe memory note / popu secret
  dietaryPreferences?: DietaryRestriction[];
  customCravings?: string;
}

export interface AnalyzeFridgeResponse {
  detectedIngredients: IngredientItem[];
  summary: string;
  suggestedRecipes: Recipe[];
}
