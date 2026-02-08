import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { FridgeIngredient } from "../../types/database";
import { CATEGORY_ICONS } from "../../constants/categories";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";
import { getExpiryStatus, getDaysUntilExpiry, formatDate } from "../../utils/dateFormatter";

interface IngredientItemProps {
  readonly ingredient: FridgeIngredient;
}

export function IngredientItem({ ingredient }: IngredientItemProps) {
  const expiryStatus = getExpiryStatus(ingredient.expiry_date);

  const handlePress = () => {
    router.push(`/fridge/${ingredient.id}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        expiryStatus === "expired" && styles.expired,
        expiryStatus === "expiring_soon" && styles.expiringSoon,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{CATEGORY_ICONS[ingredient.category]}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{ingredient.name}</Text>
        {ingredient.quantity && (
          <Text style={styles.quantity}>{ingredient.quantity}</Text>
        )}
      </View>
      {ingredient.expiry_date && (
        <View style={styles.expiryContainer}>
          {expiryStatus === "expired" && (
            <Text style={styles.expiryWarning}>期限切れ</Text>
          )}
          {expiryStatus === "expiring_soon" && (
            <Text style={styles.expiryAlert}>
              あと{getDaysUntilExpiry(ingredient.expiry_date)}日
            </Text>
          )}
          <Text style={styles.expiryDate}>
            {formatDate(ingredient.expiry_date)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  expired: {
    backgroundColor: COLORS.expired,
  },
  expiringSoon: {
    backgroundColor: COLORS.expiringSoon,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm + 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  quantity: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expiryContainer: {
    alignItems: "flex-end",
  },
  expiryWarning: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontWeight: "bold",
  },
  expiryAlert: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.warning,
    fontWeight: "bold",
  },
  expiryDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
