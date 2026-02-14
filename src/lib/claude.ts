import { supabase } from "./supabase";
import { FridgeIngredient, DinnerHistory } from "../types/database";
import { RecipeSuggestion } from "../types/recipe";

export async function suggestRecipes(
  ingredients: readonly FridgeIngredient[],
  recentDinners: readonly DinnerHistory[],
  requestText: string,
  suggestionCount: number
): Promise<readonly RecipeSuggestion[]> {
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
      requestText,
      suggestionCount,
    },
  });

  if (error) {
    let detailedMessage: string | null = null;

    if ("context" in error && error.context) {
      if (error.context.status === 401 || error.context.status === 403) {
        detailedMessage =
          "レシピ提案に失敗しました: Edge Functionの認証で拒否されました。匿名認証を有効化するか、`supabase functions deploy suggest-recipe --no-verify-jwt` で再デプロイしてください。";
      } else {
        try {
          const errorBody = await error.context.json();
          if (errorBody?.error && typeof errorBody.error === "string") {
            detailedMessage = `レシピ提案に失敗しました: ${errorBody.error}`;
          }
        } catch {
          // Fall through to the generic error message.
        }
      }
    }

    if (detailedMessage) {
      throw new Error(detailedMessage);
    }

    throw new Error(
      `レシピ提案に失敗しました: ${error.message}（Edge Function の環境変数とデプロイ設定を確認してください）`
    );
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (Array.isArray(data?.recipes)) {
    return data.recipes as RecipeSuggestion[];
  }

  // Backward compatibility when Edge Function returns a single recipe object.
  if (data?.dish_name) {
    return [data as RecipeSuggestion];
  }

  throw new Error("レシピ提案のレスポンス形式が不正です");
}
