import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDinnerHistory } from "../../hooks/useDinnerHistory";
import { DinnerHistoryItem } from "../../components/dinner/DinnerHistoryItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";

export default function HistoryScreen() {
  const { dinners, isLoading, error, refresh } = useDinnerHistory();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dinners.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="履歴がありません"
          description="右下の＋ボタンから晩御飯を記録しましょう"
        />
      ) : (
        <FlatList
          data={[...dinners]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DinnerHistoryItem dinner={item} />}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/history/add")}
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
