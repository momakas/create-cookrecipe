// Supabase Edge Function: Claude APIでレシピを提案する
// Deploy: supabase functions deploy suggest-recipe --no-verify-jwt
// Secret: supabase secrets set CLAUDE_API_KEY=sk-ant-...

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

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

function buildPrompt(
  ingredients: IngredientInput[],
  recentDinners: DinnerInput[]
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

  return `## 冷蔵庫にある材料
${ingredientList}

## 最近の晩御飯（直近2週間）
${recentList}

## お願い
上記の材料を使って、最近作っていない晩御飯のレシピを1つ提案してください。
賞味期限が近い材料があれば優先的に使ってください。

以下のJSON形式で回答してください（JSONのみ、他のテキストは含めないでください）:
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
}`;
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
    if (!claudeApiKey) {
      return new Response(
        JSON.stringify({ error: "CLAUDE_API_KEY が設定されていません" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { ingredients, recentDinners } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "冷蔵庫に材料がありません。先に材料を登録してください。" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(ingredients, recentDinners ?? []);

    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          "あなたは家庭料理の専門家です。日本の家庭料理を中心に、与えられた材料と最近の献立履歴を考慮して、晩御飯のレシピを提案してください。必ず指定されたJSON形式のみで回答してください。",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `AI APIの呼び出しに失敗しました (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text ?? "";

    // JSONをパース（前後の余分なテキストを除去）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse recipe JSON:", content);
      return new Response(
        JSON.stringify({ error: "レシピの解析に失敗しました。もう一度お試しください。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipe = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(recipe), {
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
