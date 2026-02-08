import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecipeSuggestion } from "../../types/recipe";
import { Card } from "../ui/Card";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";

interface RecipeCardProps {
  readonly recipe: RecipeSuggestion;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.dishName}>{recipe.dish_name}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{recipe.cooking_time_minutes}分</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{recipe.servings}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>材料</Text>
        {recipe.ingredients_needed.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <View
              style={[
                styles.fridgeBadge,
                ingredient.from_fridge
                  ? styles.fromFridge
                  : styles.needToBuy,
              ]}
            >
              <Text style={styles.fridgeBadgeText}>
                {ingredient.from_fridge ? "冷蔵庫" : "要購入"}
              </Text>
            </View>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>作り方</Text>
        {recipe.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {recipe.tips && (
        <View style={styles.tipsSection}>
          <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
          <Text style={styles.tipsText}>{recipe.tips}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  dishName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs + 2,
  },
  fridgeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  fromFridge: {
    backgroundColor: "#E8F5E9",
  },
  needToBuy: {
    backgroundColor: "#FFF3E0",
  },
  fridgeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  ingredientName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  ingredientQuantity: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
    color: COLORS.surface,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  tipsSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFDE7",
    padding: SPACING.sm + 4,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  tipsText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
