import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_FRIDGES } from './src/data/sampleData';
import { Recipe, IngredientItem, DietaryRestriction } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to get server-side Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Analyze Fridge or Direct Dish Generator Endpoint
app.post('/api/analyze-fridge', async (req, res) => {
  try {
    const {
      image,
      sampleId,
      manualIngredients,
      directDishQuery,
      regionalCuisineStyle,
      healthyDietFocus,
      momsSecretTweak,
      dietaryPreferences,
      customCravings,
    } = req.body;

    // Check if user selected a preset sample fridge and no new image or direct query
    if (sampleId && !image && !directDishQuery) {
      const foundSample = SAMPLE_FRIDGES.find((s) => s.id === sampleId);
      if (foundSample) {
        let recipes = [...foundSample.defaultRecipes];

        if (dietaryPreferences && dietaryPreferences.length > 0) {
          recipes = recipes.filter((r) =>
            dietaryPreferences.every((pref: DietaryRestriction) => r.dietaryTags.includes(pref))
          );
        }

        const finalRecipes = recipes.length > 0 ? recipes : foundSample.defaultRecipes;
        return res.json({
          detectedIngredients: foundSample.presetIngredients,
          summary: `Identified ${foundSample.presetIngredients.length} ingredients in the ${foundSample.title} fridge sample!`,
          suggestedRecipes: finalRecipes.map((r) => ({ ...r, isSample: true })),
        });
      }
    }

    const isDebug = process.env.DEBUG === 'true';
    const ai = getGeminiClient();

    // Fallback if no API key is available or provided
    if (!ai) {
      console.warn('GEMINI_API_KEY missing.');
      if (isDebug) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY environment variable is missing.',
        });
      }
      const sample = SAMPLE_FRIDGES[0];
      return res.json({
        detectedIngredients: sample.presetIngredients,
        summary: 'Demo Mode: Showing authentic Telugu & Indian recipes with diet-conscious substitutes.',
        suggestedRecipes: sample.defaultRecipes.map((r) => ({ ...r, isSample: true })),
      });
    }

    const parts: any[] = [];

    // If image provided as base64 string
    if (image && typeof image === 'string') {
      const mimeMatch = image.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const manualList = Array.isArray(manualIngredients) && manualIngredients.length > 0
      ? manualIngredients.join(', ')
      : 'None provided';

    const dietaryList = Array.isArray(dietaryPreferences) && dietaryPreferences.length > 0
      ? dietaryPreferences.join(', ')
      : 'No strict restrictions';

    const cravingsText = customCravings ? `User Craving / Special Note: "${customCravings}"` : '';
    const momsTweakText = momsSecretTweak ? `MOM'S TRADITIONAL RECIPE NOTE / POPU SECRET: "${momsSecretTweak}"` : '';
    const directSearchText = directDishQuery ? `DIRECT DISH SEARCH: "${directDishQuery}"` : '';
    const styleText = regionalCuisineStyle ? `PREFERRED REGIONAL STYLE: ${regionalCuisineStyle}` : 'Telugu / Andhra & Indian Focus';
    const wifeDietText = healthyDietFocus
      ? 'CRITICAL REQUIREMENT: Include low-calorie healthy substitutes & smart swaps (e.g., boiled/air-roasted nuts, air-fryer swaps, cauliflower/millet rice, Greek yogurt substitutes, jaggery/date paste) for every recipe.'
      : 'Include low-calorie healthy substitute ideas for key ingredients.';

    const textPrompt = `
You are an expert Master Chef specializing in Authentic Telugu (Andhra & Telangana), South Indian, North Indian, and Global Cuisines, with a focus on healthy diet-conscious home cooking.

CONTEXT & INPUTS:
- ${directSearchText || 'Mode: Fridge Photo Scan / Inventory'}
- Manual Ingredients: [${manualList}]
- ${styleText}
- ${momsTweakText}
- Dietary Preferences: [${dietaryList}]
- ${wifeDietText}
- ${cravingsText}

YOUR TASK:
1. If an image or manual ingredients are provided, list detected items cleanly under "detectedIngredients". If a direct dish search or Mom's style recipe is requested (e.g. Peanut Salad with carrots, onions, mustard tempering/popu), list standard kitchen pantry items required for that dish under "detectedIngredients".
2. Generate 3 to 4 authentic, highly appetizing recipe variations matching the user's requested dish, ingredients, or Mom's traditional tweak.
3. Priority Cuisine & Mom's Recipe Rules:
   - Honor Mom's recipe notes & traditional techniques (e.g. boiled/roasted peanuts, mustard seed & red chili tempering, curry leaves, raw mango, tamarind vs lemon, Gutti Vankaya, Gongura, Pappu Charu, Pesarattu).
4. FOR EVERY RECIPE, PROVIDE DETAILED HEALTHY SUBSTITUTES ("healthySubstitutes"):
   - Identify 1 to 3 heavier ingredients or cooking methods (e.g. oil-fried peanuts -> boiled/air-roasted peanuts; fried papad -> roasted makhana; heavy oil -> light olive oil spray) and provide clear, low-calorie substitutes.
   - Include calories saved (e.g. "Saved ~120 kcal"), health benefit description, and cooking adjustments.
5. COOKING STEPS INSTRUCTIONS ("steps"):
   - QUANTITIES: Every step description MUST include explicit or rough quantities inline for ingredients used in that step (e.g., "1 tsp mustard seeds, 1/2 tsp cumin, 4 crushed garlic cloves to 1 tbsp hot oil", "1/2 tsp salt", "1.5 cups warm water"). Anchor these quantities to the recipe's servings (e.g. serves 4).
   - THE "WHY" (TECHNIQUE REASONING): For each step, briefly explain WHY that step matters or what it achieves (e.g., "Low flame lo garlic fry chey, endukante high heat lo garlic burn ayi bitter avuthundi" or "Dal ni baaga mash chey, creamy texture ki ide key"). Fold the "why" naturally into each step's description or tip in Tanglish / casual English (keep it to one clear clause).
`;

    parts.push({ text: textPrompt });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedIngredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ['Produce', 'Protein', 'Dairy', 'Pantry', 'Spices', 'Grains', 'Beverages', 'Other'],
              },
              quantity: { type: Type.STRING },
              freshness: {
                type: Type.STRING,
                enum: ['Fresh', 'Use Soon', 'Frozen', 'Pantry Item'],
              },
              confidence: { type: Type.NUMBER },
              suggestedSubstitute: {
                type: Type.OBJECT,
                properties: {
                  alternativeName: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ['Healthy', 'Pantry', 'Low Calorie'],
                  },
                  reason: { type: Type.STRING },
                  caloriesSaved: { type: Type.STRING },
                },
              },
            },
            required: ['id', 'name', 'category'],
          },
        },
        summary: { type: Type.STRING },
        suggestedRecipes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              totalTimeMinutes: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              difficulty: {
                type: Type.STRING,
                enum: ['Easy', 'Medium', 'Hard'],
              },
              servings: { type: Type.NUMBER },
              cuisine: { type: Type.STRING },
              regionalStyle: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              dietaryTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              mealType: {
                type: Type.STRING,
                enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snacks'],
              },
              availableIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: ['Produce', 'Protein', 'Dairy', 'Pantry', 'Spices', 'Grains', 'Beverages', 'Other'],
                    },
                    estimatedCost: { type: Type.STRING },
                  },
                  required: ['name', 'amount'],
                },
              },
              healthySubstitutes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalIngredient: { type: Type.STRING },
                    substituteIngredient: { type: Type.STRING },
                    caloriesSaved: { type: Type.STRING },
                    healthBenefit: { type: Type.STRING },
                    cookingAdjustment: { type: Type.STRING },
                  },
                  required: ['originalIngredient', 'substituteIngredient', 'caloriesSaved'],
                },
              },
              chefTip: { type: Type.STRING },
              nutritionalFacts: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fat: { type: Type.STRING },
                  fiber: { type: Type.STRING },
                  micronutrients: {
                    type: Type.OBJECT,
                    properties: {
                      ironMg: { type: Type.NUMBER },
                      calciumMg: { type: Type.NUMBER },
                      vitaminCMg: { type: Type.NUMBER },
                      potassiumMg: { type: Type.NUMBER },
                      sodiumMg: { type: Type.NUMBER },
                    },
                  },
                },
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.NUMBER },
                    tip: { type: Type.STRING },
                    technique: { type: Type.STRING },
                    ingredientsUsed: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['stepNumber', 'title', 'description'],
                },
              },
            },
            required: [
              'id',
              'title',
              'description',
              'prepTime',
              'cookTime',
              'calories',
              'healthySubstitutes',
              'steps',
            ],
          },
        },
      },
      required: ['detectedIngredients', 'summary', 'suggestedRecipes'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr: any) {
      console.error('Failed to parse Gemini JSON output:', responseText.slice(0, 200), parseErr);
      if (isDebug) {
        return res.status(500).json({
          error: 'Failed to parse Gemini JSON output',
          details: parseErr?.message || String(parseErr),
          rawResponse: responseText,
        });
      }
      const sample = SAMPLE_FRIDGES[0];
      return res.json({
        detectedIngredients: sample.presetIngredients,
        summary: 'Generated delicious home-style recipes with diet substitutes.',
        suggestedRecipes: sample.defaultRecipes.map((r) => ({ ...r, isSample: true })),
      });
    }

    // Attach high-res food images
    if (parsedData.suggestedRecipes && Array.isArray(parsedData.suggestedRecipes)) {
      parsedData.suggestedRecipes = parsedData.suggestedRecipes.map((recipe: Recipe, index: number) => {
        if (!recipe.imageUrl) {
          const indianImages = [
            'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80',
          ];
          recipe.imageUrl = indianImages[index % indianImages.length];
        }
        return recipe;
      });
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/analyze-fridge:', error);
    const isDebug = process.env.DEBUG === 'true';
    if (isDebug) {
      return res.status(500).json({
        error: error?.message || 'Error executing Gemini API call',
        stack: error?.stack,
        details: String(error),
      });
    }
    const sample = SAMPLE_FRIDGES[0];
    return res.status(200).json({
      detectedIngredients: sample.presetIngredients,
      summary: 'Analysis completed.',
      suggestedRecipes: sample.defaultRecipes.map((r) => ({ ...r, isSample: true })),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Fridge Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
