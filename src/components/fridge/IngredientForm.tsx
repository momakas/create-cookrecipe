import { useState } from "react";
import { View, StyleSheet, ScrollView, Platform, Text, TouchableOpacity } from "react-native";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { CategoryPicker } from "../ui/CategoryPicker";
import { IngredientCategory } from "../../types/database";
import { validateIngredientName, validateQuantity, validateDate } from "../../utils/validation";
import { getTodayString } from "../../utils/dateFormatter";
import { COLORS, SPACING, FONT_SIZE } from "../../constants/theme";

interface IngredientFormData {
  readonly name: string;
  readonly quantity: string;
  readonly category: IngredientCategory;
  readonly expiry_date: string;
}

interface IngredientFormProps {
  readonly initialData?: Partial<IngredientFormData>;
  readonly onSubmit: (data: IngredientFormData) => Promise<void>;
  readonly submitLabel: string;
  readonly loading?: boolean;
}

export function IngredientForm({
  initialData,
  onSubmit,
  submitLabel,
  loading = false,
}: IngredientFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [quantity, setQuantity] = useState(initialData?.quantity ?? "");
  const [category, setCategory] = useState<IngredientCategory>(
    initialData?.category ?? "その他"
  );
  const [expiryDate, setExpiryDate] = useState(initialData?.expiry_date ?? "");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = (): boolean => {
    const nameError = validateIngredientName(name);
    const quantityError = validateQuantity(quantity);
    const dateError = expiryDate ? validateDate(expiryDate) : null;

    const newErrors = {
      name: nameError,
      quantity: quantityError,
      expiry_date: dateError,
    };
    setErrors(newErrors);

    return !nameError && !quantityError && !dateError;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      quantity: quantity.trim() || "",
      category,
      expiry_date: expiryDate || "",
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Input
        label="材料名"
        required
        placeholder="例: 鶏もも肉"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

      <Input
        label="数量"
        placeholder="例: 200g、3個"
        value={quantity}
        onChangeText={setQuantity}
        error={errors.quantity}
      />

      <CategoryPicker selected={category} onSelect={setCategory} />

      <Input
        label="賞味期限"
        placeholder="例: 2026-02-15"
        value={expiryDate}
        onChangeText={setExpiryDate}
        error={errors.expiry_date}
        keyboardType="numbers-and-punctuation"
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
