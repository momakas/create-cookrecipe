// Supabase Edge Function: Claude APIでレシピを提案する
// Deploy: supabase functions deploy suggest-recipe --no-verify-jwt
// Secret: supabase secrets set CLAUDE_API_KEY=sk-ant-...

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const FALLBACK_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
];

interface IngredientInput {
  name: string;
  quantity: string | null;
  category: string;
  expiry_date: string | null;
}

interface DinnerInput {
  dish_name: string;
  dinner_date: string;
}

interface RecipeOutput {
  dish_name: string;
  description: string;
  cooking_time_minutes: number;
  servings: string;
  ingredients_needed: Array<{
    name: string;
    quantity: string;
    from_fridge: boolean;
  }>;
  steps: string[];
  tips: string;
}

function clampSuggestionCount(input: unknown): number {
  if (typeof input !== "number" || Number.isNaN(input)) return 5;
  if (input < 1) return 1;
  if (input > 5) return 5;
  return Math.floor(input);
}

function buildPrompt(
  ingredients: IngredientInput[],
  recentDinners: DinnerInput[],
  requestText: string,
  suggestionCount: number
): string {
  const ingredientList = ingredients
    .map(
      (i) =>
        `- ${i.name}${i.quantity ? `（${i.quantity}）` : ""}${
          i.expiry_date ? `【期限: ${i.expiry_date}】` : ""
        }`
    )
    .join("\n");

  const recentList =
    recentDinners
      .map((d) => `- ${d.dinner_date}: ${d.dish_name}`)
      .join("\n") || "（履歴なし）";

  const userRequestSection = requestText
    ? `## ユーザーからの追加リクエスト
${requestText}`
    : "";

  return `## 冷蔵庫にある材料
${ingredientList}

## 最近の晩御飯（直近2週間）
${recentList}

${userRequestSection}

## お願い
上記の情報をもとに、最近作っていない晩御飯のレシピを${suggestionCount}つ提案してください。
冷蔵庫の材料は全て使い切る必要はありません。必要なものだけ使って構いません。
賞味期限が近い材料は優先して使ってください。
追加リクエストがある場合はそれも反映してください。

以下のJSON形式で回答してください（JSONのみ、他のテキストは含めないでください）:
{
  "recipes": [
    {
      "dish_name": "料理名",
      "description": "一言説明",
      "cooking_time_minutes": 30,
      "servings": "2人前",
      "ingredients_needed": [
        { "name": "材料名", "quantity": "量", "from_fridge": true }
      ],
      "steps": [
        "手順1",
        "手順2"
      ],
      "tips": "ワンポイントアドバイス"
    }
  ]
}`;
}

function normalizeRecipes(payload: unknown): RecipeOutput[] {
  if (
    payload &&
    typeof payload === "object" &&
    "recipes" in payload &&
    Array.isArray((payload as { recipes: unknown }).recipes)
  ) {
    return (payload as { recipes: RecipeOutput[] }).recipes;
  }

  if (Array.isArray(payload)) {
    return payload as RecipeOutput[];
  }

  if (payload && typeof payload === "object" && "dish_name" in payload) {
    return [payload as RecipeOutput];
  }

  throw new Error("レシピの解析に失敗しました。もう一度お試しください。");
}

function extractJsonFromText(content: string): unknown {
  const text = content.trim();
  if (!text) {
    throw new Error("レシピの解析に失敗しました。もう一度お試しください。");
  }

  try {
    return JSON.parse(text);
  } catch {
    // Fall through to block extraction.
  }

  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    throw new Error("レシピの解析に失敗しました。もう一度お試しください。");
  }

  return JSON.parse(objectMatch[0]);
}

Deno.serve(async (req) => {
  // CORSヘッダー
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    const rawClaudeModel =
      Deno.env.get("CLAUDE_MODEL") ?? "claude-3-5-sonnet-latest";
    const claudeModel =
      rawClaudeModel === "claude-3.5-sonnet-latest"
        ? "claude-3-5-sonnet-latest"
        : rawClaudeModel;
    if (!claudeApiKey) {
      return new Response(
        JSON.stringify({ error: "CLAUDE_API_KEY が設定されていません" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { ingredients, recentDinners, requestText, suggestionCount } =
      await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "冷蔵庫に材料がありません。先に材料を登録してください。" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(
      ingredients,
      recentDinners ?? [],
      typeof requestText === "string" ? requestText.trim() : "",
      clampSuggestionCount(suggestionCount)
    );

    const modelsToTry = [
      claudeModel,
      ...FALLBACK_MODELS.filter((m) => m !== claudeModel),
    ];

    let response: Response | null = null;
    let lastDetail = "AI APIの呼び出しに失敗しました";

    for (const model of modelsToTry) {
      response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system:
            "あなたは家庭料理の専門家です。日本の家庭料理を中心に、与えられた材料と最近の献立履歴を考慮して、晩御飯のレシピを提案してください。必ず指定されたJSON形式のみで回答してください。",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        break;
      }

      const errorBody = await response.text();
      console.error("Claude API error:", model, response.status, errorBody);

      let detail = `AI APIの呼び出しに失敗しました (${response.status})`;
      try {
        const parsed = JSON.parse(errorBody);
        const apiMessage =
          parsed?.error?.message ??
          parsed?.message ??
          parsed?.error ??
          null;
        if (typeof apiMessage === "string" && apiMessage.length > 0) {
          detail = `AI APIの呼び出しに失敗しました (${response.status}): ${apiMessage}`;
        }
      } catch {
        // Ignore JSON parse error and keep generic detail message.
      }
      lastDetail = detail;

      // 404 model not found は別モデルで再試行。それ以外は即失敗。
      if (response.status !== 404) {
        break;
      }
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: lastDetail }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text ?? "";

    let recipes: RecipeOutput[];
    try {
      const payload = extractJsonFromText(content);
      recipes = normalizeRecipes(payload);
    } catch (parseError) {
      console.error("Failed to parse recipe JSON:", content);
      return new Response(
        JSON.stringify({
          error:
            parseError instanceof Error
              ? parseError.message
              : "レシピの解析に失敗しました。もう一度お試しください。",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "予期しないエラーが発生しました",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
