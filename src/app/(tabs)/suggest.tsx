import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeSuggestion } from "../../hooks/useRecipeSuggestion";
import { useFridgeIngredients } from "../../hooks/useFridgeIngredients";
import { RecipeCard } from "../../components/recipe/RecipeCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { CATEGORY_ICONS } from "../../constants/categories";
import { COLORS, SPACING, FONT_SIZE } from "../../constants/theme";
import { RecipeSuggestion } from "../../types/recipe";

const SUGGESTION_COUNTS = [1, 3, 5] as const;

export default function SuggestScreen() {
  const { ingredients, isLoading: ingredientsLoading, refresh } =
    useFridgeIngredients();
  const {
    suggestions,
    isGenerating,
    error,
    generateSuggestion,
    saveToHistory,
    clearSuggestion,
  } = useRecipeSuggestion();
  const [isSaving, setIsSaving] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [suggestionCount, setSuggestionCount] = useState<number>(5);
  const previousIngredientKeyRef = useRef<string>("");

  const ingredientKey = useMemo(
    () =>
      [...ingredients]
        .map((i) => `${i.id}:${i.name}:${i.quantity ?? ""}:${i.category}:${i.expiry_date ?? ""}`)
        .sort()
        .join("|"),
    [ingredients]
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (!previousIngredientKeyRef.current) {
      previousIngredientKeyRef.current = ingredientKey;
      return;
    }

    if (previousIngredientKeyRef.current !== ingredientKey) {
      clearSuggestion();
      previousIngredientKeyRef.current = ingredientKey;
    }
  }, [ingredientKey, clearSuggestion]);

  const handleGenerate = async () => {
    await generateSuggestion(requestText.trim(), suggestionCount);
  };

  const handleSaveToHistory = async (recipe: RecipeSuggestion) => {
    try {
      setIsSaving(true);
      await saveToHistory(recipe);
      Alert.alert("保存しました", "晩御飯の履歴に保存しました。");
    } catch (err) {
      Alert.alert(
        "エラー",
        err instanceof Error ? err.message : "履歴への保存に失敗しました"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (ingredientsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (ingredients.length === 0) {
    return (
      <EmptyState
        icon="cube-outline"
        title="材料を先に登録してください"
        description="冷蔵庫タブから材料を追加すると、AIがレシピを提案できます"
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.requestCard}>
        <Input
          label="AIへの追加リクエスト（任意）"
          value={requestText}
          onChangeText={setRequestText}
          placeholder="例: 20分以内、辛くない、和食、子ども向け など"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.requestInput}
        />
        <Text style={styles.countLabel}>提案数</Text>
        <View style={styles.countButtons}>
          {SUGGESTION_COUNTS.map((count) => (
            <Button
              key={count}
              title={`${count}件`}
              variant={count === suggestionCount ? "primary" : "secondary"}
              onPress={() => setSuggestionCount(count)}
              style={styles.countButton}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>冷蔵庫の材料</Text>
        <View style={styles.ingredientChips}>
          {ingredients.map((item) => (
            <View key={item.id} style={styles.chip}>
              <Text style={styles.chipIcon}>
                {CATEGORY_ICONS[item.category]}
              </Text>
              <Text style={styles.chipText}>{item.name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.ingredientCount}>
          {ingredients.length}種類の材料
        </Text>
      </Card>

      {isGenerating ? (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.generatingText}>レシピを考えています...</Text>
        </View>
      ) : suggestions.length > 0 ? (
        <View>
          {suggestions.map((recipe, index) => (
            <View key={`${recipe.dish_name}-${index}`}>
              <Text style={styles.recipeIndex}>提案 {index + 1}</Text>
              <RecipeCard recipe={recipe} />
              <View style={styles.actionButtons}>
                <Button
                  title="この献立を履歴に保存"
                  onPress={() => handleSaveToHistory(recipe)}
                  loading={isSaving}
                />
              </View>
            </View>
          ))}

          <View style={styles.actionButtons}>
            <Button
              title="もう一度提案してもらう"
              variant="ghost"
              onPress={handleGenerate}
            />
          </View>
        </View>
      ) : (
        <View style={styles.promptContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="AIにレシピを提案してもらう"
            onPress={handleGenerate}
            style={styles.suggestButton}
          />
          <Text style={styles.hintText}>
            冷蔵庫の材料を一部使って、最近の献立も考慮しつつ{"\n"}
            AIが今日の晩御飯を提案します
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    marginBottom: SPACING.md,
  },
  requestCard: {
    marginBottom: SPACING.md,
  },
  requestInput: {
    minHeight: 90,
  },
  countLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  countButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  countButton: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ingredientChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
  },
  ingredientCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  generatingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  generatingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  promptContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  suggestButton: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  hintText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.expired,
    padding: SPACING.sm + 4,
    borderRadius: 8,
    marginBottom: SPACING.md,
    width: "100%",
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  actionButtons: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  recipeIndex: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});
