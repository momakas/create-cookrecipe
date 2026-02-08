import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/theme";

interface ButtonProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: "primary" | "secondary" | "danger" | "ghost";
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "ghost" ? COLORS.primary : COLORS.surface}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "ghost" && styles.ghostText,
            variant === "danger" && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  danger: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.error,
  },
});
