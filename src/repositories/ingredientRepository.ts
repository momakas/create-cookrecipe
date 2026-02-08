import { supabase } from "../lib/supabase";
import {
  FridgeIngredient,
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientCategory,
} from "../types/database";

const TABLE = "fridge_ingredients";

export const ingredientRepository = {
  async findAll(): Promise<readonly FridgeIngredient[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("category")
      .order("name");

    if (error) throw new Error(`材料の取得に失敗: ${error.message}`);
    return data as FridgeIngredient[];
  },

  async findById(id: string): Promise<FridgeIngredient | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`材料の取得に失敗: ${error.message}`);
    }
    return data as FridgeIngredient;
  },

  async findByCategory(
    category: IngredientCategory
  ): Promise<readonly FridgeIngredient[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .order("name");

    if (error)
      throw new Error(`カテゴリ別材料の取得に失敗: ${error.message}`);
    return data as FridgeIngredient[];
  },

  async findExpiringSoon(days: number): Promise<readonly FridgeIngredient[]> {
    const until = new Date();
    until.setDate(until.getDate() + days);
    const untilStr = until.toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .not("expiry_date", "is", null)
      .lte("expiry_date", untilStr)
      .gte("expiry_date", todayStr)
      .order("expiry_date");

    if (error)
      throw new Error(`期限切れ間近の材料の取得に失敗: ${error.message}`);
    return data as FridgeIngredient[];
  },

  async create(input: CreateIngredientInput): Promise<FridgeIngredient> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(`材料の登録に失敗: ${error.message}`);
    return data as FridgeIngredient;
  },

  async update(
    id: string,
    input: UpdateIngredientInput
  ): Promise<FridgeIngredient> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`材料の更新に失敗: ${error.message}`);
    return data as FridgeIngredient;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`材料の削除に失敗: ${error.message}`);
  },
};
