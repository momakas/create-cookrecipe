import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { validateDishName, validateDate } from "../../utils/validation";
import { getTodayString } from "../../utils/dateFormatter";
import { COLORS, SPACING } from "../../constants/theme";

interface DinnerFormData {
  readonly dish_name: string;
  readonly dinner_date: string;
  readonly notes: string;
}

interface DinnerFormProps {
  readonly initialData?: Partial<DinnerFormData>;
  readonly onSubmit: (data: DinnerFormData) => Promise<void>;
  readonly submitLabel: string;
  readonly loading?: boolean;
}

export function DinnerForm({
  initialData,
  onSubmit,
  submitLabel,
  loading = false,
}: DinnerFormProps) {
  const [dishName, setDishName] = useState(initialData?.dish_name ?? "");
  const [dinnerDate, setDinnerDate] = useState(
    initialData?.dinner_date ?? getTodayString()
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = (): boolean => {
    const nameError = validateDishName(dishName);
    const dateError = validateDate(dinnerDate);

    const newErrors = {
      dish_name: nameError,
      dinner_date: dateError,
    };
    setErrors(newErrors);

    return !nameError && !dateError;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      dish_name: dishName.trim(),
      dinner_date: dinnerDate,
      notes: notes.trim(),
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Input
        label="料理名"
        required
        placeholder="例: カレーライス"
        value={dishName}
        onChangeText={setDishName}
        error={errors.dish_name}
      />

      <Input
        label="日付"
        placeholder="例: 2026-02-08"
        value={dinnerDate}
        onChangeText={setDinnerDate}
        error={errors.dinner_date}
        keyboardType="numbers-and-punctuation"
      />

      <Input
        label="メモ"
        placeholder="例: 子供も喜んでくれた"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.notesInput}
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
