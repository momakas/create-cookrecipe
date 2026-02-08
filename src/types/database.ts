export type IngredientCategory =
  | "肉類"
  | "魚介類"
  | "野菜"
  | "果物"
  | "乳製品"
  | "卵"
  | "調味料"
  | "穀物・麺類"
  | "豆腐・大豆製品"
  | "冷凍食品"
  | "その他";

export interface DinnerHistory {
  readonly id: string;
  readonly dish_name: string;
  readonly dinner_date: string;
  readonly notes: string | null;
  readonly recipe_text: string | null;
  readonly cooking_time_minutes: number | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CreateDinnerInput {
  readonly dish_name: string;
  readonly dinner_date: string;
  readonly notes?: string;
  readonly recipe_text?: string;
  readonly cooking_time_minutes?: number;
}

export interface UpdateDinnerInput {
  readonly dish_name?: string;
  readonly dinner_date?: string;
  readonly notes?: string | null;
  readonly recipe_text?: string | null;
  readonly cooking_time_minutes?: number | null;
}

export interface FridgeIngredient {
  readonly id: string;
  readonly name: string;
  readonly quantity: string | null;
  readonly category: IngredientCategory;
  readonly expiry_date: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CreateIngredientInput {
  readonly name: string;
  readonly quantity?: string;
  readonly category?: IngredientCategory;
  readonly expiry_date?: string;
}

export interface UpdateIngredientInput {
  readonly name?: string;
  readonly quantity?: string | null;
  readonly category?: IngredientCategory;
  readonly expiry_date?: string | null;
}
