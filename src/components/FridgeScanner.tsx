import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, Plus, Trash2, RefreshCw, Layers, Heart, Utensils, Compass, Flame } from 'lucide-react';
import { SAMPLE_FRIDGES } from '../data/sampleData';
import { IngredientItem, IngredientCategory, DietaryRestriction } from '../types';

interface FridgeScannerProps {
  onAnalyze: (payload: {
    image?: string;
    sampleId?: string;
    manualIngredients?: string[];
    directDishQuery?: string;
    regionalCuisineStyle?: string;
    healthyDietFocus?: boolean;
    dietaryPreferences?: DietaryRestriction[];
    customCravings?: string;
  }) => Promise<void>;
  detectedIngredients: IngredientItem[];
  setDetectedIngredients: React.Dispatch<React.SetStateAction<IngredientItem[]>>;
  isLoading: boolean;
  onNavigateToRecipes: () => void;
  dietaryPreferences: DietaryRestriction[];
  setDietaryPreferences: React.Dispatch<React.SetStateAction<DietaryRestriction[]>>;
}

const CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Protein',
  'Dairy',
  'Pantry',
  'Grains',
  'Spices',
  'Beverages',
  'Other',
];

const QUICK_DISH_SUGGESTIONS = [
  { name: 'Gutti Vankaya Kura', style: 'Telugu / Andhra', icon: '🌶️', desc: 'Stuffed Eggplant Curry' },
  { name: 'Andhra Pappu Charu', style: 'Telugu / Andhra', icon: '🍲', desc: 'Tangy Tempered Lentil Soup' },
  { name: 'Pesarattu Upma', style: 'Telugu / Andhra', icon: '🥞', desc: 'Protein Green Gram Crepe' },
  { name: 'Gongura Chicken or Paneer', style: 'Telugu / Andhra', icon: '🍃', desc: 'Roselle Leaves Tangy Curry' },
  { name: 'Hyderabadi Dum Biryani', style: 'Indian', icon: '🥘', desc: 'Aromatic Layered Rice & Spices' },
  { name: 'Tuscan Garlic Salmon', style: 'Global', icon: '🐟', desc: 'Herb Skillet Fish' },
];

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  onAnalyze,
  detectedIngredients,
  setDetectedIngredients,
  isLoading,
  onNavigateToRecipes,
  dietaryPreferences,
  setDietaryPreferences,
}) => {
  const [generatorMode, setGeneratorMode] = useState<'direct' | 'fridge'>('direct');
  const [directDishName, setDirectDishName] = useState<string>('');
  const [cuisineStyle, setCuisineStyle] = useState<string>('Telugu / Andhra');
  const [healthyDietFocus, setHealthyDietFocus] = useState<boolean>(true);

  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_FRIDGES[0].id);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [newIngredientCategory, setNewIngredientCategory] = useState<IngredientCategory>('Produce');
  const [customCraving, setCustomCraving] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle sample selection
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setCustomImagePreview(null);
    const sample = SAMPLE_FRIDGES.find((s) => s.id === sampleId);
    if (sample) {
      setDetectedIngredients(sample.presetIngredients);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomImagePreview(base64);
        setSelectedSampleId('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera handling
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please upload an image file instead.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCustomImagePreview(dataUrl);
        setSelectedSampleId('');
      }
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Trigger analysis for direct dish or fridge
  const handleRunAnalysis = async (customDishOverride?: string) => {
    const dishToQuery = customDishOverride || directDishName;
    const manualIngredients = detectedIngredients.map((i) => `${i.name} (${i.quantity || 'available'})`);

    await onAnalyze({
      directDishQuery: generatorMode === 'direct' ? dishToQuery : undefined,
      regionalCuisineStyle: cuisineStyle,
      healthyDietFocus,
      image: generatorMode === 'fridge' ? customImagePreview || undefined : undefined,
      sampleId: generatorMode === 'fridge' && !customImagePreview ? selectedSampleId : undefined,
      manualIngredients: generatorMode === 'fridge' ? manualIngredients : undefined,
      dietaryPreferences,
      customCravings: customCraving,
    });
    onNavigateToRecipes();
  };

  // Add new manual ingredient
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const newItem: IngredientItem = {
      id: `custom_${Date.now()}`,
      name: newIngredientName.trim(),
      category: newIngredientCategory,
      freshness: 'Fresh',
      confidence: 100,
    };

    setDetectedIngredients((prev) => [...prev, newItem]);
    setNewIngredientName('');
  };

  const handleDeleteIngredient = (id: string) => {
    setDetectedIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner Header - Natural Tones Theme */}
      <div className="bg-[#F1EFE6] border-2 border-[#5A5A40] rounded-[40px] p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#5A5A40] text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#A3A375]" /> Personal Kitchen AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#2D2D20] leading-tight">
            Authentic Telugu & Global Cooking
          </h1>
          <p className="text-[#5A5A40] text-sm sm:text-base leading-relaxed">
            Generate authentic Indian & Telugu home dishes without using camera photos, or scan your fridge shelves. Includes low-calorie, diet-conscious substitutes tailored for your family.
          </p>
        </div>

        {/* Quick Mode Toggle Pill */}
        <div className="bg-white p-2 rounded-2xl border border-[#E6E2D3] shadow-sm flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setGeneratorMode('direct')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              generatorMode === 'direct'
                ? 'bg-[#5A5A40] text-white shadow-md'
                : 'text-[#8E8E7A] hover:bg-[#F5F5F0]'
            }`}
          >
            <Utensils className="w-4 h-4" /> Direct Dish AI
          </button>
          <button
            onClick={() => setGeneratorMode('fridge')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              generatorMode === 'fridge'
                ? 'bg-[#5A5A40] text-white shadow-md'
                : 'text-[#8E8E7A] hover:bg-[#F5F5F0]'
            }`}
          >
            <Camera className="w-4 h-4" /> Fridge Photo Scan
          </button>
        </div>
      </div>

      {/* MODE 1: DIRECT DISH AI GENERATOR (NO CAMERA REQUIRED) */}
      {generatorMode === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Input Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold">
                  Custom Recipe Craving
                </span>
                <h2 className="text-2xl font-serif italic font-bold text-[#2D2D20]">
                  What dish would you like to cook today?
                </h2>
                <p className="text-xs text-[#8E8E7A]">
                  Type any Telugu, Indian or International dish name (e.g. "Gutti Vankaya Kura", "Gongura Chicken", "Paneer Tikka"). No fridge photo needed.
                </p>
              </div>

              {/* Main Dish Search Input */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={directDishName}
                    onChange={(e) => setDirectDishName(e.target.value)}
                    placeholder="e.g., Gutti Vankaya Kura, Andhra Pappu Charu, Butter Chicken..."
                    className="w-full bg-[#F9F8F4] border-2 border-[#E6E2D3] focus:border-[#5A5A40] rounded-2xl px-5 py-4 text-base text-[#333322] font-medium placeholder-[#8E8E7A] focus:outline-none transition-colors"
                  />
                  {directDishName && (
                    <button
                      onClick={() => setDirectDishName('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8E7A] hover:text-[#333322]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Regional Cuisine Style Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold block">
                    Preferred Culinary Style:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Telugu / Andhra', 'South Indian', 'North Indian', 'Pan-Indian', 'Global & Fusion'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setCuisineStyle(style)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          cuisineStyle === style
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                            : 'bg-[#F5F5F0] text-[#333322] border-[#D1CEC0] hover:border-[#5A5A40]'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet-Conscious Wife Toggle */}
                <div className="p-4 bg-[#F1EFE6] border border-[#E6E2D3] rounded-2xl flex items-center justify-between gap-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#2D2D20] block">
                        Low-Calorie & Healthy Substitutes for Wife
                      </span>
                      <p className="text-[11px] text-[#5A5A40]">
                        Automatically suggests air-fry swaps, cauliflower/millet rice, and Greek yogurt bases before finalizing ingredients.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={healthyDietFocus}
                      onChange={(e) => setHealthyDietFocus(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#D1CEC0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>
              </div>

              {/* Generate Dish Button */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-base"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#A3A375]" />
                    Crafting Authentic Recipe & Healthy Substitutes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#A3A375]" />
                    Generate Recipe & Healthy Substitutes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Telugu & Global Recipe Suggestions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold">
                  Quick Telugu & Classic Ideas
                </span>
                <h3 className="text-lg font-serif italic font-bold text-[#2D2D20]">
                  Popular Telugu & Global Dishes
                </h3>
              </div>

              <div className="space-y-3">
                {QUICK_DISH_SUGGESTIONS.map((dish) => (
                  <div
                    key={dish.name}
                    onClick={() => {
                      setDirectDishName(dish.name);
                      handleRunAnalysis(dish.name);
                    }}
                    className="p-4 bg-[#F9F8F4] hover:bg-[#F1EFE6] border border-[#E6E2D3] hover:border-[#5A5A40] rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dish.icon}</span>
                      <div>
                        <span className="text-sm font-bold text-[#2D2D20] group-hover:text-[#5A5A40] block">
                          {dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E8E7A] block">
                          {dish.desc} • <span className="font-semibold text-[#5A5A40]">{dish.style}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#5A5A40] group-hover:translate-x-1 transition-transform">
                      Cook →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FRIDGE PHOTO SCANNER */}
      {generatorMode === 'fridge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo Input & Sample Picker (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold">
                    Fridge Vision Scan
                  </span>
                  <h2 className="text-xl font-serif italic font-bold text-[#2D2D20]">
                    Upload or Snap Your Fridge
                  </h2>
                </div>
              </div>

              {/* Camera / Upload Dropzone */}
              {cameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      onClick={capturePhoto}
                      className="px-6 py-2.5 bg-[#5A5A40] text-white rounded-full font-bold shadow-lg hover:bg-[#4A4A35] flex items-center gap-2 text-xs"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2.5 bg-white text-[#333322] rounded-full text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : customImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#5A5A40] bg-[#F9F8F4] aspect-video flex items-center justify-center">
                  <img src={customImagePreview} alt="Uploaded Fridge" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-[#333322] rounded-full text-xs font-bold"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setCustomImagePreview(null)}
                      className="px-4 py-2 bg-rose-600 text-white rounded-full text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D1CEC0] hover:border-[#5A5A40] rounded-2xl p-8 text-center bg-[#F9F8F4] transition-all cursor-pointer space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D20]">
                      Click to upload a fridge photo <span className="text-[#8E8E7A] font-normal">or drag & drop</span>
                    </p>
                    <p className="text-xs text-[#8E8E7A] mt-1">Supports JPG, PNG up to 10MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="px-4 py-2 rounded-full bg-[#5A5A40] text-white text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" /> Take Snap with Camera
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Preset Fridge Sample */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold block">
                  Or pick a sample fridge setup:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_FRIDGES.map((sample) => {
                    const isSelected = selectedSampleId === sample.id && !customImagePreview;
                    return (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#F1EFE6] border-2 border-[#5A5A40] shadow-md'
                            : 'bg-[#F9F8F4] border-[#E6E2D3] hover:border-[#D1CEC0]'
                        }`}
                      >
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2D2D20]">{sample.title}</p>
                          <p className="text-[11px] text-[#8E8E7A] truncate">{sample.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Identified Ingredients (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 shadow-sm space-y-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8E8E7A] font-bold block">
                  Fridge Inventory
                </span>
                <h3 className="text-lg font-serif italic font-bold text-[#2D2D20]">
                  Detected Ingredients ({detectedIngredients.length})
                </h3>
              </div>

              {/* Category Breakdown Chips */}
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const catItems = detectedIngredients.filter((item) => item.category === cat);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <span className="text-[10px] font-bold text-[#8E8E7A] uppercase tracking-widest">
                        {cat} ({catItems.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F0] border border-[#D1CEC0] text-xs text-[#333322]"
                          >
                            <span className="font-medium">{item.name}</span>
                            <button
                              onClick={() => handleDeleteIngredient(item.id)}
                              className="text-[#8E8E7A] hover:text-rose-600 transition-colors ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Add Ingredient */}
              <form onSubmit={handleAddIngredient} className="flex gap-2 pt-2 border-t border-[#E6E2D3]">
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="Add item (e.g. Tamarind, Curry leaves)..."
                  className="flex-1 bg-[#F9F8F4] border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#333322] placeholder-[#8E8E7A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Action Button */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#A3A375]" />
                    Analyzing Fridge...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#A3A375]" />
                    Find Recipes from Fridge Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
