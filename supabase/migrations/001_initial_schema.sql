-- CookRecipe 初期スキーマ

-- 材料カテゴリのENUM型
CREATE TYPE ingredient_category AS ENUM (
  '肉類',
  '魚介類',
  '野菜',
  '果物',
  '乳製品',
  '卵',
  '調味料',
  '穀物・麺類',
  '豆腐・大豆製品',
  '冷凍食品',
  'その他'
);

-- 晩御飯の履歴テーブル
CREATE TABLE dinner_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_name TEXT NOT NULL,
  dinner_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  recipe_text TEXT,
  cooking_time_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 冷蔵庫の材料テーブル
CREATE TABLE fridge_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  category ingredient_category DEFAULT 'その他',
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dinner_history_updated_at
  BEFORE UPDATE ON dinner_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fridge_ingredients_updated_at
  BEFORE UPDATE ON fridge_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- インデックス
CREATE INDEX idx_dinner_history_date ON dinner_history(dinner_date DESC);
CREATE INDEX idx_fridge_ingredients_category ON fridge_ingredients(category);
CREATE INDEX idx_fridge_ingredients_expiry ON fridge_ingredients(expiry_date);

-- RLSポリシー（個人利用向け簡易設定）
ALTER TABLE dinner_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON dinner_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON fridge_ingredients
  FOR ALL USING (true) WITH CHECK (true);
