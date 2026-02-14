import { useState, useCallback } from "react";
import { suggestRecipes } from "../lib/claude";
import { ingredientRepository } from "../repositories/ingredientRepository";
import { dinnerRepository } from "../repositories/dinnerRepository";
import { RecipeSuggestion } from "../types/recipe";
import { CreateDinnerInput } from "../types/database";

interface UseRecipeSuggestionResult {
  readonly suggestions: readonly RecipeSuggestion[];
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly generateSuggestion: (
    requestText: string,
    suggestionCount: number
  ) => Promise<void>;
  readonly saveToHistory: (recipe: RecipeSuggestion) => Promise<void>;
  readonly clearSuggestion: () => void;
}

function isValidRecipe(value: unknown): value is RecipeSuggestion {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<RecipeSuggestion>;
  return (
    typeof v.dish_name === "string" &&
    typeof v.description === "string" &&
    typeof v.cooking_time_minutes === "number" &&
    typeof v.servings === "string" &&
    Array.isArray(v.ingredients_needed) &&
    Array.isArray(v.steps) &&
    typeof v.tips === "string"
  );
}

export function useRecipeSuggestion(): UseRecipeSuggestionResult {
  const [suggestions, setSuggestions] = useState<readonly RecipeSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = useCallback(async (
    requestText: string,
    suggestionCount: number
  ) => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuggestions([]);

      const [ingredients, recentDinners] = await Promise.all([
        ingredientRepository.findAll(),
        dinnerRepository.findRecent(14),
      ]);

      if (ingredients.length === 0) {
        setError("冷蔵庫に材料がありません。先に材料を登録してください。");
        return;
      }

      const requestedCount = Math.min(Math.max(Math.floor(suggestionCount), 1), 5);
      const merged: RecipeSuggestion[] = [];
      const seen = new Set<string>();

      // Edge Function が1件しか返さない場合に備えて、足りない分を再取得する。
      for (let attempt = 0; attempt < requestedCount * 2; attempt++) {
        const remaining = requestedCount - merged.length;
        if (remaining <= 0) break;

        const batch = await suggestRecipes(
          ingredients,
          recentDinners,
          requestText,
          remaining
        );

        const validBatch = batch.filter(isValidRecipe);
        if (validBatch.length === 0) break;

        for (const recipe of validBatch) {
          const key = recipe.dish_name.trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(recipe);
          }
          if (merged.length >= requestedCount) break;
        }
      }

      if (merged.length === 0) {
        throw new Error("レシピ提案の取得に失敗しました。もう一度お試しください。");
      }

      setSuggestions(merged);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "レシピの提案に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveToHistory = useCallback(async (recipe: RecipeSuggestion) => {
    const recipeText = [
      recipe.description,
      "",
      `調理時間: ${recipe.cooking_time_minutes}分 / ${recipe.servings}`,
      "",
      "【材料】",
      ...recipe.ingredients_needed.map(
        (i) => `- ${i.name}: ${i.quantity}${i.from_fridge ? "" : "（要購入）"}`
      ),
      "",
      "【手順】",
      ...recipe.steps.map((s, idx) => `${idx + 1}. ${s}`),
      "",
      `💡 ${recipe.tips}`,
    ].join("\n");

    const input: CreateDinnerInput = {
      dish_name: recipe.dish_name,
      dinner_date: new Date().toISOString().split("T")[0],
      recipe_text: recipeText,
      cooking_time_minutes: recipe.cooking_time_minutes,
    };

    await dinnerRepository.create(input);
  }, []);

  const clearSuggestion = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isGenerating,
    error,
    generateSuggestion,
    saveToHistory,
    clearSuggestion,
  };
}
