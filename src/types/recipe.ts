export interface RecipeIngredient {
  readonly name: string;
  readonly quantity: string;
  readonly from_fridge: boolean;
}

export interface RecipeSuggestion {
  readonly dish_name: string;
  readonly description: string;
  readonly cooking_time_minutes: number;
  readonly servings: string;
  readonly ingredients_needed: readonly RecipeIngredient[];
  readonly steps: readonly string[];
  readonly tips: string;
}

export interface RecipeSuggestionResponse {
  readonly recipes: readonly RecipeSuggestion[];
}
