import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { IngredientCategory } from "../../types/database";
import { INGREDIENT_CATEGORIES, CATEGORY_ICONS } from "../../constants/categories";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";

interface CategoryPickerProps {
  readonly selected: IngredientCategory;
  readonly onSelect: (category: IngredientCategory) => void;
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>カテゴリ</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {INGREDIENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              selected === category && styles.chipSelected,
            ]}
            onPress={() => onSelect(category)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipIcon}>{CATEGORY_ICONS[category]}</Text>
            <Text
              style={[
                styles.chipText,
                selected === category && styles.chipTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: FONT_SIZE.md,
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
