import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Flame,
  ChefHat,
  Heart,
  Leaf,
} from 'lucide-react';
import { Recipe, MissingIngredient, MealCategory } from '../types';
import { speechManager } from '../utils/speech';

interface CookingStudioModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddMissingToShoppingList: (items: MissingIngredient[], recipeTitle: string) => void;
  onLogToTracker?: (recipe: Recipe, category: MealCategory) => void;
}

export const CookingStudioModal: React.FC<CookingStudioModalProps> = ({
  recipe,
  onClose,
  onAddMissingToShoppingList,
  onLogToTracker,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [addedShoppingSuccess, setAddedShoppingSuccess] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  // Timer state
  const currentStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const defaultDurationSeconds = (currentStep.durationMinutes || 5) * 60;
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(defaultDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reset step timer when step changes
  useEffect(() => {
    const newSeconds = (currentStep.durationMinutes || 5) * 60;
    setTimerSecondsLeft(newSeconds);
    setIsTimerRunning(false);

    // Stop previous voice reading
    speechManager.stop();
    setIsPlayingVoice(false);

    // Auto read step if auto advance enabled
    if (autoAdvance) {
      readCurrentStep(newSeconds);
    }
  }, [currentStepIndex]);

  // Handle timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        // silent
      }
      speechManager.speak('Timer complete! Proceed to the next step.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Read current step out loud
  const readCurrentStep = (overrideDuration?: number) => {
    const stepText = `Step ${currentStep.stepNumber}: ${currentStep.title}. ${currentStep.description} ${
      currentStep.tip ? 'Chef tip: ' + currentStep.tip : ''
    }`;

    setIsPlayingVoice(true);
    speechManager.speak(stepText, {
      rate: speechRate,
      onEnd: () => {
        setIsPlayingVoice(false);
      },
      onError: () => {
        setIsPlayingVoice(false);
      },
    });
  };

  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      speechManager.stop();
      setIsPlayingVoice(false);
    } else {
      readCurrentStep();
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleIngredientChecked = (ingName: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ingName]: !prev[ingName],
    }));
  };

  const handleAddMissingToShopping = () => {
    if (recipe.missingIngredients.length > 0) {
      onAddMissingToShoppingList(recipe.missingIngredients, recipe.title);
      setAddedShoppingSuccess(true);
      setTimeout(() => setAddedShoppingSuccess(false), 2500);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F9F8F4]/98 backdrop-blur-xl flex flex-col overflow-y-auto">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E6E2D3] px-6 sm:px-10 py-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold shadow-sm">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest">Hands-Free Cooking Studio</span>
              <span className="text-xs text-[#8E8E7A]">• {recipe.regionalStyle || recipe.cuisine}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2D2D20] line-clamp-1">{recipe.title}</h2>
          </div>
        </div>

        {/* Voice Read Aloud & Log Meal & Close Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onLogToTracker && (
            <button
              onClick={() => {
                const category: MealCategory = (recipe.mealType as MealCategory) || 'Lunch';
                onLogToTracker(recipe, category);
                setLoggedSuccess(true);
                setTimeout(() => setLoggedSuccess(false), 2500);
              }}
              className={`px-3.5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                loggedSuccess
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#F5F5F0] text-[#333322] border border-[#D1CEC0] hover:bg-[#E6E2D3]'
              }`}
            >
              <Flame className="w-4 h-4 text-[#5A5A40]" />
              <span className="hidden sm:inline">{loggedSuccess ? 'Logged!' : '+ Log Meal'}</span>
            </button>
          )}

          <button
            onClick={toggleVoicePlayback}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              isPlayingVoice
                ? 'bg-[#5A5A40] text-white ring-2 ring-[#5A5A40]/40 animate-pulse'
                : 'bg-[#F5F5F0] text-[#333322] border border-[#D1CEC0] hover:bg-[#E6E2D3]'
            }`}
          >
            {isPlayingVoice ? <Volume2 className="w-4 h-4 text-[#A3A375]" /> : <VolumeX className="w-4 h-4 text-[#5A5A40]" />}
            <span className="hidden sm:inline">{isPlayingVoice ? 'Speaking...' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={() => {
              speechManager.stop();
              onClose();
            }}
            className="p-2.5 rounded-full bg-[#F5F5F0] text-[#8E8E7A] hover:text-[#2D2D20] hover:bg-[#E6E2D3] transition-colors"
            title="Exit Cooking Studio"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Studio Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-10 space-y-8 flex flex-col justify-between">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#8E8E7A] tracking-wider">
            <span>STEP {currentStepIndex + 1} OF {recipe.steps.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / recipe.steps.length) * 100)}% COMPLETED</span>
          </div>
          <div className="w-full h-3 bg-[#E6E2D3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5A5A40] transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Big Step Instruction Box - Natural Tones */}
        <div className="bg-white border-2 border-[#5A5A40] rounded-[40px] p-8 sm:p-12 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3.5 py-1 rounded-full bg-[#F5F5F0] text-[#5A5A40] border border-[#D1CEC0] text-xs font-bold uppercase tracking-widest">
                Step {currentStep.stepNumber}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#2D2D20] tracking-tight pt-3">
                {currentStep.title}
              </h1>
            </div>

            {currentStep.technique && (
              <span className="hidden sm:inline-block px-4 py-1.5 rounded-full bg-[#F5F5F0] text-[#5A5A40] border border-[#D1CEC0] text-xs font-bold">
                {currentStep.technique}
              </span>
            )}
          </div>

          {/* LARGE Hands-Free Text */}
          <p className="text-[#333322] text-xl sm:text-2xl font-medium leading-relaxed">
            {currentStep.description}
          </p>

          {/* Chef Tip */}
          {currentStep.tip && (
            <div className="bg-[#F1EFE6] border border-[#D1CEC0] rounded-2xl p-4 flex items-start gap-3 text-[#333322] text-sm">
              <Sparkles className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[#5A5A40] text-xs uppercase tracking-wider">Chef Secret</span>
                {currentStep.tip}
              </div>
            </div>
          )}

          {/* Timer & Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E2D3] items-center">
            {/* Countdown Timer */}
            <div className="bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8E7A] uppercase font-bold block">Step Timer</span>
                  <span className="text-2xl font-mono font-bold text-[#2D2D20] tracking-wider">
                    {formatTime(timerSecondsLeft)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                    isTimerRunning
                      ? 'bg-[#A3A375] text-white'
                      : 'bg-[#5A5A40] text-white hover:bg-[#4A4A35]'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsLeft((currentStep.durationMinutes || 5) * 60);
                  }}
                  className="p-2 rounded-full bg-white text-[#8E8E7A] border border-[#D1CEC0] hover:text-[#2D2D20]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read Aloud Settings */}
            <div className="bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#333322] font-semibold">
                <Volume2 className="w-4 h-4 text-[#5A5A40]" />
                <span>Voice Speed:</span>
              </div>
              <div className="flex items-center gap-1">
                {[0.8, 0.95, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-3 py-1 rounded-full font-mono text-xs ${
                      speechRate === rate
                        ? 'bg-[#5A5A40] text-white font-bold'
                        : 'bg-white text-[#8E8E7A] border border-[#D1CEC0]'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Healthy Low-Calorie Substitutes Panel for Wife */}
        {recipe.healthySubstitutes && recipe.healthySubstitutes.length > 0 && (
          <div className="bg-[#F1EFE6] border-2 border-[#5A5A40] rounded-[32px] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
              <h3 className="font-serif italic font-bold text-lg text-[#2D2D20]">
                Diet-Conscious Low-Calorie Substitutes (for Wife)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.healthySubstitutes.map((sub, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E6E2D3] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8E8E7A] line-through">
                      Original: {sub.originalIngredient}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5A5A40] text-white">
                      {sub.caloriesSaved}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#2D2D20]">
                    <Leaf className="w-4 h-4 text-[#5A5A40]" />
                    <span>Swap: {sub.substituteIngredient}</span>
                  </div>
                  <p className="text-xs text-[#5A5A40]">{sub.healthBenefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Step Ingredients Checklist & Missing Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 space-y-4">
            <h3 className="font-serif italic font-bold text-base text-[#2D2D20] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
              Ingredients Needed for this Step
            </h3>
            <div className="space-y-2">
              {(currentStep.ingredientsUsed || recipe.availableIngredients.slice(0, 4)).map((ing) => {
                const isChecked = Boolean(checkedIngredients[ing]);
                return (
                  <div
                    key={ing}
                    onClick={() => toggleIngredientChecked(ing)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#F1EFE6] border-[#5A5A40] text-[#8E8E7A] line-through'
                        : 'bg-[#F9F8F4] border-[#E6E2D3] text-[#333322] hover:border-[#D1CEC0]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{ing}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isChecked ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'border-[#D1CEC0]'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing Ingredients Warning */}
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-serif italic font-bold text-base text-[#2D2D20] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A3A375]" />
                Missing Pantry Items
              </h3>
              {recipe.missingIngredients.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {recipe.missingIngredients.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs text-[#333322] bg-[#F9F8F4] p-2.5 rounded-xl border border-[#E6E2D3]">
                      <span className="font-medium">• {item.name} ({item.amount})</span>
                      <span className="font-mono text-[#8E8E7A]">{item.estimatedCost || '$1.00'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5A5A40] font-bold mt-2">All ingredients are available in your kitchen!</p>
              )}
            </div>

            {recipe.missingIngredients.length > 0 && (
              <button
                onClick={handleAddMissingToShopping}
                className={`w-full py-3 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  addedShoppingSuccess
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#5A5A40] hover:bg-[#4A4A35] text-white shadow-sm'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {addedShoppingSuccess ? 'Added to List!' : `+ Add ${recipe.missingIngredients.length} Missing to Shopping List`}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E6E2D3] p-4 rounded-3xl flex items-center justify-between gap-4 shadow-lg">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 rounded-full bg-[#F5F5F0] border border-[#D1CEC0] hover:bg-[#E6E2D3] text-[#333322] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>

          <span className="text-xs text-[#8E8E7A] font-bold hidden sm:inline">
            Step {currentStepIndex + 1} of {recipe.steps.length}
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === recipe.steps.length - 1}
            className="px-8 py-3 rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
