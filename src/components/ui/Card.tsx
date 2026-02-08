import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

interface CardProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
