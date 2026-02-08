import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE } from "../../constants/theme";

interface EmptyStateProps {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textLight} />
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
});
