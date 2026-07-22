import { IngredientItem, IngredientSubstituteSuggestion } from '../types';

interface SubstituteRule {
  keywords: string[];
  alternativeName: string;
  type: 'Healthy' | 'Pantry' | 'Low Calorie';
  caloriesSaved?: string;
  reason: string;
}

const COMMON_SUBSTITUTE_RULES: SubstituteRule[] = [
  {
    keywords: ['heavy cream', 'whipping cream', 'malai'],
    alternativeName: 'Whisked Low-Fat Greek Yogurt',
    type: 'Healthy',
    caloriesSaved: 'Saved ~160 kcal',
    reason: 'Provides velvet restaurant thickness with 75% less fat and 3x protein.',
  },
  {
    keywords: ['butter', 'ghee', 'excess oil'],
    alternativeName: 'Cold-Pressed Sesame Oil Spray (1/2 tsp)',
    type: 'Low Calorie',
    caloriesSaved: 'Saved ~120 kcal',
    reason: 'Keeps authentic sizzle & tempering aroma with minimal fat.',
  },
  {
    keywords: ['white rice', 'basmati rice'],
    alternativeName: 'Foxtail Millet (Korralu) or Cauliflower Rice',
    type: 'Healthy',
    caloriesSaved: 'Saved ~130 kcal',
    reason: 'Low glycemic index, rich in complex fiber & dietary minerals.',
  },
  {
    keywords: ['deep fried', 'fried papad', 'bhujia', 'sev'],
    alternativeName: 'Dry-Roasted Makhana (Foxnuts)',
    type: 'Healthy',
    caloriesSaved: 'Saved ~90 kcal',
    reason: 'Adds crisp crunch with zero trans-fats and extra dietary fiber.',
  },
  {
    keywords: ['tamarind', 'tamarind pulp', 'tamarind paste'],
    alternativeName: 'Fresh Lemon Juice + Pinch of Amchur (Dry Mango)',
    type: 'Pantry',
    caloriesSaved: 'Saved ~20 kcal',
    reason: 'Quick pantry sourness without needing fresh tamarind soaking.',
  },
  {
    keywords: ['gongura', 'sorrel leaves'],
    alternativeName: 'Fresh Spinach + Extra Lemon Juice',
    type: 'Pantry',
    reason: 'Easy pantry substitute for signature tangy South Indian greens.',
  },
  {
    keywords: ['fresh coconut', 'desiccated coconut'],
    alternativeName: 'Roasted Chana Dal (Dalia) or Sesame Seeds',
    type: 'Pantry',
    caloriesSaved: 'Saved ~70 kcal',
    reason: 'Great body & nuttiness for chutneys with lower saturated fat.',
  },
  {
    keywords: ['maida', 'white flour', 'all purpose flour'],
    alternativeName: 'Whole Wheat Atta / Oats Flour',
    type: 'Healthy',
    caloriesSaved: 'Saved ~50 kcal',
    reason: 'Slower carbohydrate release and higher digestive fiber.',
  },
  {
    keywords: ['sugar', 'white sugar'],
    alternativeName: 'Organic Jaggery or Date Paste',
    type: 'Healthy',
    caloriesSaved: 'Saved ~30 kcal',
    reason: 'Unrefined natural sweetening packed with iron & minerals.',
  },
  {
    keywords: ['potato', 'potatoes', 'aloo'],
    alternativeName: 'Boiled Sweet Potato or Raw Banana (Arbi/Kand)',
    type: 'Healthy',
    caloriesSaved: 'Saved ~45 kcal',
    reason: 'Sustained energy release with a lower glycemic spike.',
  },
  {
    keywords: ['paneer', 'cottage cheese'],
    alternativeName: 'Low-Fat Tofu or Low-Fat Paneer',
    type: 'Low Calorie',
    caloriesSaved: 'Saved ~80 kcal',
    reason: 'High protein content with lower saturated fat per 100g.',
  },
  {
    keywords: ['peanuts', 'fried peanuts'],
    alternativeName: 'Pressure-Boiled Raw Peanuts with Salt & Turmeric',
    type: 'Healthy',
    caloriesSaved: 'Saved ~110 kcal',
    reason: 'Eliminates deep-frying oil while enhancing plant protein digestion.',
  },
];

export function getSubstituteForIngredientName(
  ingredientName: string
): IngredientSubstituteSuggestion | null {
  const lower = ingredientName.toLowerCase().trim();
  for (const rule of COMMON_SUBSTITUTE_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        alternativeName: rule.alternativeName,
        type: rule.type,
        caloriesSaved: rule.caloriesSaved,
        reason: rule.reason,
      };
    }
  }
  return null;
}

export function enrichIngredientsWithSubstitutes(
  items: IngredientItem[]
): IngredientItem[] {
  return items.map((item) => {
    if (item.suggestedSubstitute) return item;
    const sub = getSubstituteForIngredientName(item.name);
    return sub ? { ...item, suggestedSubstitute: sub } : item;
  });
}
