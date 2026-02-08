import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { DinnerForm } from "../../components/dinner/DinnerForm";
import { dinnerRepository } from "../../repositories/dinnerRepository";

export default function AddHistoryScreen() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    dish_name: string;
    dinner_date: string;
    notes: string;
  }) => {
    try {
      setLoading(true);
      await dinnerRepository.create({
        dish_name: data.dish_name,
        dinner_date: data.dinner_date,
        notes: data.notes || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "エラー",
        err instanceof Error ? err.message : "晩御飯の登録に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DinnerForm onSubmit={handleSubmit} submitLabel="記録する" loading={loading} />
  );
}
