import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { IngredientForm } from "../../components/fridge/IngredientForm";
import { ingredientRepository } from "../../repositories/ingredientRepository";

export default function AddIngredientScreen() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    quantity: string;
    category: string;
    expiry_date: string;
  }) => {
    try {
      setLoading(true);
      await ingredientRepository.create({
        name: data.name,
        quantity: data.quantity || undefined,
        category: data.category as any,
        expiry_date: data.expiry_date || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "エラー",
        err instanceof Error ? err.message : "材料の追加に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return <IngredientForm onSubmit={handleSubmit} submitLabel="追加する" loading={loading} />;
}
