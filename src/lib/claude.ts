import { supabase } from "./supabase";
import { FridgeIngredient, DinnerHistory } from "../types/database";
import { RecipeSuggestion } from "../types/recipe";

export async function suggestRecipe(
  ingredients: readonly FridgeIngredient[],
  recentDinners: readonly DinnerHistory[]
): Promise<RecipeSuggestion> {
  const { data, error } = await supabase.functions.invoke("suggest-recipe", {
    body: {
      ingredients: ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        category: i.category,
        expiry_date: i.expiry_date,
      })),
      recentDinners: recentDinners.map((d) => ({
        dish_name: d.dish_name,
        dinner_date: d.dinner_date,
      })),
    },
  });

  if (error) {
    throw new Error(`レシピ提案に失敗しました: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as RecipeSuggestion;
}
