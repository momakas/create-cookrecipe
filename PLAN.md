# CookRecipe - 個人用晩御飯レシピ提案アプリ 実装計画

## Context

自分専用の晩御飯レシピ提案スマホアプリを新規作成する。冷蔵庫の材料と晩御飯の履歴を管理し、それらの情報をもとにClaude APIでレシピを自動提案する。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | React Native (Expo SDK 52) + TypeScript |
| ルーティング | Expo Router v4 (ファイルベース) |
| データベース | Supabase (PostgreSQL) |
| AI API | Claude API (Supabase Edge Function経由) |
| テスト | Jest + @testing-library/react-native |

## データベーススキーマ

### `dinner_history` テーブル（晩御飯の履歴）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 自動生成 |
| dish_name | TEXT NOT NULL | 料理名 |
| dinner_date | DATE | 日付（デフォルト: 今日） |
| notes | TEXT | メモ |
| recipe_text | TEXT | AI生成レシピ本文 |
| cooking_time_minutes | INT | 調理時間（分） |
| created_at / updated_at | TIMESTAMPTZ | タイムスタンプ |

### `fridge_ingredients` テーブル（冷蔵庫の材料）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 自動生成 |
| name | TEXT NOT NULL | 材料名 |
| quantity | TEXT | 数量（"3個", "200g" など自由入力） |
| category | ENUM | カテゴリ（肉類/魚介類/野菜/果物/乳製品/卵/調味料/穀物・麺類/豆腐・大豆製品/冷凍食品/その他） |
| expiry_date | DATE | 賞味期限（任意） |
| created_at / updated_at | TIMESTAMPTZ | タイムスタンプ |

### 認証・セキュリティ
- 個人利用のため匿名認証 + シンプルなRLSポリシー
- Claude APIキーはSupabase Edge Functionのサーバーサイドで管理（クライアントに露出させない）

## 画面構成（3タブ）

```
┌──────────────────────────────────────┐
│          [画面コンテンツ]              │
├──────────┬───────────┬───────────────┤
│  📋 履歴  │  🧊 冷蔵庫  │  🤖 AI提案    │
└──────────┴───────────┴───────────────┘
```

| 画面 | パス | 機能 |
|------|------|------|
| 晩御飯一覧 | `(tabs)/history` | 日付降順リスト、スワイプ削除 |
| 晩御飯追加 | `history/add` | 料理名・日付・メモの入力 |
| 晩御飯編集 | `history/[id]` | 編集・削除 |
| 冷蔵庫一覧 | `(tabs)/fridge` | カテゴリ別グループ表示、期限切れ警告 |
| 材料追加 | `fridge/add` | 材料名・数量・カテゴリ・賞味期限 |
| 材料編集 | `fridge/[id]` | 編集・削除 |
| AI提案 | `(tabs)/suggest` | 材料サマリー → レシピ生成 → 履歴保存 |

## プロジェクト構造

```
create-cookrecipe/
├── app.config.ts              # Expo設定（環境変数読み込み）
├── package.json
├── tsconfig.json
├── .env / .env.example        # SUPABASE_URL, SUPABASE_ANON_KEY, CLAUDE_API_KEY
├── supabase/
│   └── functions/
│       └── suggest-recipe/
│           └── index.ts       # Claude API呼び出しEdge Function
├── src/
│   ├── app/                   # Expo Router画面
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # タブナビゲーション
│   │   │   ├── history.tsx
│   │   │   ├── fridge.tsx
│   │   │   └── suggest.tsx
│   │   ├── history/
│   │   │   ├── add.tsx
│   │   │   └── [id].tsx
│   │   └── fridge/
│   │       ├── add.tsx
│   │       └── [id].tsx
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, DatePicker, etc.
│   │   ├── dinner/            # DinnerForm, DinnerHistoryItem, DinnerHistoryList
│   │   ├── fridge/            # IngredientForm, IngredientItem, CategoryGroup
│   │   └── recipe/            # RecipeCard, RecipeSteps
│   ├── hooks/                 # useDinnerHistory, useFridgeIngredients, useRecipeSuggestion
│   ├── repositories/          # dinnerRepository, ingredientRepository
│   ├── services/              # recipeService (プロンプト構築・レスポンスパース)
│   ├── lib/                   # supabase.ts, claude.ts
│   ├── types/                 # database.ts, recipe.ts
│   ├── constants/             # categories.ts, theme.ts
│   └── utils/                 # dateFormatter.ts, validation.ts
└── __tests__/
```

## アーキテクチャ（レイヤー構成）

```
画面 (app/) → カスタムフック (hooks/) → リポジトリ/サービス (repositories/, services/) → ライブラリ (lib/) → 外部API
```

## AI レシピ提案の仕組み

1. クライアントが冷蔵庫の材料一覧 + 直近2週間の晩御飯履歴を取得
2. Supabase Edge Function (`suggest-recipe`) を呼び出し
3. Edge Function内でClaude APIにプロンプト送信（材料・履歴を含む）
4. 構造化JSON形式でレシピを受け取り（料理名・材料・手順・調理時間・コツ）
5. クライアントでレシピカードとして表示
6. ユーザーが「履歴に保存」ボタンで `dinner_history` に登録

## 実装フェーズ

### Phase 1: プロジェクト基盤
- Expo プロジェクト初期化 (`create-expo-app`)
- 依存パッケージインストール
- TypeScript / 環境変数 / Supabaseクライアント設定
- Expo Router タブナビゲーション設定
- 型定義・定数ファイル作成

### Phase 2: Supabase DB セットアップ
- テーブル作成（SQL）
- RLSポリシー設定
- リポジトリ層の実装（CRUD操作）

### Phase 3: 冷蔵庫材料管理（材料がないとレシピ提案できないので先に実装）
- 汎用UIコンポーネント作成
- 材料一覧画面（カテゴリ別グループ表示）
- 材料追加・編集・削除画面
- 賞味期限切れ警告表示

### Phase 4: 晩御飯履歴管理
- 履歴一覧画面（日付降順）
- 履歴追加・編集・削除画面
- 日付フォーマットユーティリティ

### Phase 5: AIレシピ提案
- Supabase Edge Function作成（Claude API呼び出し）
- プロンプト構築ロジック
- AI提案画面（材料サマリー → 生成 → 結果表示）
- 提案レシピの履歴保存機能

### Phase 6: 仕上げ
- エラーハンドリング・ローディング・空状態の統一
- UIテーマ統一
- Expo Go / 実機テスト

## 検証方法

1. `npx expo start` でExpo Go上で各画面を確認
2. 材料のCRUD操作がSupabaseに正しく反映されることを確認
3. 履歴のCRUD操作がSupabaseに正しく反映されることを確認
4. AI提案ボタンでClaude APIからレシピが返ること、レシピが正しく表示されることを確認
5. 提案レシピを履歴に保存できることを確認
6. Jest テスト実行（`npm test`）でリポジトリ・サービス・ユーティリティのテストがパスすること
