import { Alert } from "react-native";

export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void
): void {
  Alert.alert(title, message, [
    { text: "キャンセル", style: "cancel" },
    { text: "OK", style: "destructive", onPress: onConfirm },
  ]);
}
