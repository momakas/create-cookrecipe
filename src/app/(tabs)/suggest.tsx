import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeSuggestion } from "../../hooks/useRecipeSuggestion";
import { useFridgeIngredients } from "../../hooks/useFridgeIngredients";
import { RecipeCard } from "../../components/recipe/RecipeCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { CATEGORY_ICONS } from "../../constants/categories";
import { COLORS, SPACING, FONT_SIZE } from "../../constants/theme";

export default function SuggestScreen() {
  const { ingredients, isLoading: ingredientsLoading } = useFridgeIngredients();
  const {
    suggestion,
    isGenerating,
    error,
    generateSuggestion,
    saveToHistory,
    clearSuggestion,
  } = useRecipeSuggestion();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToHistory = async () => {
    try {
      setIsSaving(true);
      await saveToHistory();
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
          <Text style={styles.generatingText}>
            レシピを考えています...
          </Text>
        </View>
      ) : suggestion ? (
        <View>
          <RecipeCard recipe={suggestion} />

          <View style={styles.actionButtons}>
            <Button
              title="この献立を履歴に保存"
              onPress={handleSaveToHistory}
              loading={isSaving}
            />
            <Button
              title="もう一度提案してもらう"
              variant="ghost"
              onPress={generateSuggestion}
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
            onPress={generateSuggestion}
            style={styles.suggestButton}
          />
          <Text style={styles.hintText}>
            冷蔵庫の材料と最近の献立をもとに{"\n"}
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
  },
});
