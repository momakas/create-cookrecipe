import { supabase } from "../lib/supabase";
import {
  DinnerHistory,
  CreateDinnerInput,
  UpdateDinnerInput,
} from "../types/database";

const TABLE = "dinner_history";

export const dinnerRepository = {
  async findAll(
    limit = 50,
    offset = 0
  ): Promise<readonly DinnerHistory[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("dinner_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`晩御飯履歴の取得に失敗: ${error.message}`);
    return data as DinnerHistory[];
  },

  async findById(id: string): Promise<DinnerHistory | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`晩御飯履歴の取得に失敗: ${error.message}`);
    }
    return data as DinnerHistory;
  },

  async findRecent(days: number): Promise<readonly DinnerHistory[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .gte("dinner_date", sinceStr)
      .order("dinner_date", { ascending: false });

    if (error) throw new Error(`直近の晩御飯履歴の取得に失敗: ${error.message}`);
    return data as DinnerHistory[];
  },

  async create(input: CreateDinnerInput): Promise<DinnerHistory> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(`晩御飯履歴の登録に失敗: ${error.message}`);
    return data as DinnerHistory;
  },

  async update(id: string, input: UpdateDinnerInput): Promise<DinnerHistory> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`晩御飯履歴の更新に失敗: ${error.message}`);
    return data as DinnerHistory;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`晩御飯履歴の削除に失敗: ${error.message}`);
  },
};
