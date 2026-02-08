import { View, Text, SectionList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFridgeIngredients } from "../../hooks/useFridgeIngredients";
import { IngredientItem } from "../../components/fridge/IngredientItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { CATEGORY_ICONS } from "../../constants/categories";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";
import { IngredientCategory } from "../../types/database";

export default function FridgeScreen() {
  const { grouped, isLoading, error, refresh } = useFridgeIngredients();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const sections = grouped.map((group) => ({
    title: group.category,
    data: [...group.items],
  }));

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="材料がありません"
          description="右下の＋ボタンから材料を追加しましょう"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IngredientItem ingredient={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>
                {CATEGORY_ICONS[title as IngredientCategory]}
              </Text>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={isLoading}
          stickySectionHeadersEnabled={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/fridge/add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
