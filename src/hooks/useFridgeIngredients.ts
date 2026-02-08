import { useState, useEffect, useCallback } from "react";
import { ingredientRepository } from "../repositories/ingredientRepository";
import {
  FridgeIngredient,
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientCategory,
} from "../types/database";

interface GroupedIngredients {
  readonly category: IngredientCategory;
  readonly items: readonly FridgeIngredient[];
}

interface UseFridgeIngredientsResult {
  readonly ingredients: readonly FridgeIngredient[];
  readonly grouped: readonly GroupedIngredients[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly addIngredient: (input: CreateIngredientInput) => Promise<void>;
  readonly updateIngredient: (
    id: string,
    input: UpdateIngredientInput
  ) => Promise<void>;
  readonly removeIngredient: (id: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

function groupByCategory(
  ingredients: readonly FridgeIngredient[]
): readonly GroupedIngredients[] {
  const map = new Map<IngredientCategory, FridgeIngredient[]>();

  for (const item of ingredients) {
    const existing = map.get(item.category) ?? [];
    map.set(item.category, [...existing, item]);
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export function useFridgeIngredients(): UseFridgeIngredientsResult {
  const [ingredients, setIngredients] = useState<readonly FridgeIngredient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ingredientRepository.findAll();
      setIngredients(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "材料の取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const addIngredient = useCallback(
    async (input: CreateIngredientInput) => {
      await ingredientRepository.create(input);
      await fetchIngredients();
    },
    [fetchIngredients]
  );

  const updateIngredient = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      await ingredientRepository.update(id, input);
      await fetchIngredients();
    },
    [fetchIngredients]
  );

  const removeIngredient = useCallback(
    async (id: string) => {
      await ingredientRepository.remove(id);
      await fetchIngredients();
    },
    [fetchIngredients]
  );

  const grouped = groupByCategory(ingredients);

  return {
    ingredients,
    grouped,
    isLoading,
    error,
    addIngredient,
    updateIngredient,
    removeIngredient,
    refresh: fetchIngredients,
  };
}
