import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DinnerHistory } from "../../types/database";
import { formatDate } from "../../utils/dateFormatter";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";

interface DinnerHistoryItemProps {
  readonly dinner: DinnerHistory;
}

export function DinnerHistoryItem({ dinner }: DinnerHistoryItemProps) {
  const handlePress = () => {
    router.push(`/history/${dinner.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.dishName}>{dinner.dish_name}</Text>
        <Text style={styles.date}>{formatDate(dinner.dinner_date)}</Text>
        {dinner.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {dinner.notes}
          </Text>
        )}
      </View>
      {dinner.cooking_time_minutes && (
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.time}>{dinner.cooking_time_minutes}分</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm + 4,
  },
  info: {
    flex: 1,
  },
  dishName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notes: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginLeft: 2,
  },
});
