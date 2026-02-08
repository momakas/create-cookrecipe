import { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { IngredientForm } from "../../components/fridge/IngredientForm";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { showConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ingredientRepository } from "../../repositories/ingredientRepository";
import { FridgeIngredient } from "../../types/database";
import { COLORS, SPACING } from "../../constants/theme";

export default function IngredientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ingredient, setIngredient] = useState<FridgeIngredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        const data = await ingredientRepository.findById(id);
        setIngredient(data);
      } catch (err) {
        Alert.alert("エラー", "材料の取得に失敗しました");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchIngredient();
  }, [id]);

  if (isLoading || !ingredient) return <LoadingSpinner />;

  const handleSubmit = async (data: {
    name: string;
    quantity: string;
    category: string;
    expiry_date: string;
  }) => {
    try {
      setIsSaving(true);
      await ingredientRepository.update(id, {
        name: data.name,
        quantity: data.quantity || null,
        category: data.category as any,
        expiry_date: data.expiry_date || null,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "エラー",
        err instanceof Error ? err.message : "材料の更新に失敗しました"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirmDialog(
      "材料を削除",
      `「${ingredient.name}」を削除しますか？`,
      async () => {
        try {
          setIsDeleting(true);
          await ingredientRepository.remove(id);
          router.back();
        } catch (err) {
          Alert.alert(
            "エラー",
            err instanceof Error ? err.message : "材料の削除に失敗しました"
          );
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <IngredientForm
        initialData={{
          name: ingredient.name,
          quantity: ingredient.quantity ?? "",
          category: ingredient.category,
          expiry_date: ingredient.expiry_date ?? "",
        }}
        onSubmit={handleSubmit}
        submitLabel="更新する"
        loading={isSaving}
      />
      <View style={styles.deleteContainer}>
        <Button
          title="この材料を削除"
          variant="danger"
          onPress={handleDelete}
          loading={isDeleting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  deleteContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
