import { useState, useCallback } from "react";
import { suggestRecipe } from "../lib/claude";
import { ingredientRepository } from "../repositories/ingredientRepository";
import { dinnerRepository } from "../repositories/dinnerRepository";
import { RecipeSuggestion } from "../types/recipe";
import { CreateDinnerInput } from "../types/database";

interface UseRecipeSuggestionResult {
  readonly suggestion: RecipeSuggestion | null;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly generateSuggestion: () => Promise<void>;
  readonly saveToHistory: () => Promise<void>;
  readonly clearSuggestion: () => void;
}

export function useRecipeSuggestion(): UseRecipeSuggestionResult {
  const [suggestion, setSuggestion] = useState<RecipeSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuggestion(null);

      const [ingredients, recentDinners] = await Promise.all([
        ingredientRepository.findAll(),
        dinnerRepository.findRecent(14),
      ]);

      if (ingredients.length === 0) {
        setError("冷蔵庫に材料がありません。先に材料を登録してください。");
        return;
      }

      const result = await suggestRecipe(ingredients, recentDinners);
      setSuggestion(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "レシピの提案に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveToHistory = useCallback(async () => {
    if (!suggestion) return;

    const recipeText = [
      suggestion.description,
      "",
      `調理時間: ${suggestion.cooking_time_minutes}分 / ${suggestion.servings}`,
      "",
      "【材料】",
      ...suggestion.ingredients_needed.map(
        (i) => `- ${i.name}: ${i.quantity}${i.from_fridge ? "" : "（要購入）"}`
      ),
      "",
      "【手順】",
      ...suggestion.steps.map((s, idx) => `${idx + 1}. ${s}`),
      "",
      `💡 ${suggestion.tips}`,
    ].join("\n");

    const input: CreateDinnerInput = {
      dish_name: suggestion.dish_name,
      dinner_date: new Date().toISOString().split("T")[0],
      recipe_text: recipeText,
      cooking_time_minutes: suggestion.cooking_time_minutes,
    };

    await dinnerRepository.create(input);
  }, [suggestion]);

  const clearSuggestion = useCallback(() => {
    setSuggestion(null);
    setError(null);
  }, []);

  return {
    suggestion,
    isGenerating,
    error,
    generateSuggestion,
    saveToHistory,
    clearSuggestion,
  };
}
