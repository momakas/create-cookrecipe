import { IngredientCategory } from "../types/database";

export const INGREDIENT_CATEGORIES: readonly IngredientCategory[] = [
  "肉類",
  "魚介類",
  "野菜",
  "果物",
  "乳製品",
  "卵",
  "調味料",
  "穀物・麺類",
  "豆腐・大豆製品",
  "冷凍食品",
  "その他",
] as const;

export const CATEGORY_ICONS: Record<IngredientCategory, string> = {
  肉類: "🥩",
  魚介類: "🐟",
  野菜: "🥬",
  果物: "🍎",
  乳製品: "🧀",
  卵: "🥚",
  調味料: "🧂",
  "穀物・麺類": "🍚",
  "豆腐・大豆製品": "🫘",
  冷凍食品: "🧊",
  その他: "📦",
};
