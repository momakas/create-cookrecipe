import { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DinnerForm } from "../../components/dinner/DinnerForm";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { showConfirmDialog } from "../../components/ui/ConfirmDialog";
import { dinnerRepository } from "../../repositories/dinnerRepository";
import { DinnerHistory } from "../../types/database";
import { COLORS, SPACING, FONT_SIZE } from "../../constants/theme";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dinner, setDinner] = useState<DinnerHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDinner = async () => {
      try {
        const data = await dinnerRepository.findById(id);
        setDinner(data);
      } catch (err) {
        Alert.alert("エラー", "履歴の取得に失敗しました");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDinner();
  }, [id]);

  if (isLoading || !dinner) return <LoadingSpinner />;

  const handleSubmit = async (data: {
    dish_name: string;
    dinner_date: string;
    notes: string;
  }) => {
    try {
      setIsSaving(true);
      await dinnerRepository.update(id, {
        dish_name: data.dish_name,
        dinner_date: data.dinner_date,
        notes: data.notes || null,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "エラー",
        err instanceof Error ? err.message : "履歴の更新に失敗しました"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirmDialog(
      "履歴を削除",
      `「${dinner.dish_name}」を削除しますか？`,
      async () => {
        try {
          setIsDeleting(true);
          await dinnerRepository.remove(id);
          router.back();
        } catch (err) {
          Alert.alert(
            "エラー",
            err instanceof Error ? err.message : "履歴の削除に失敗しました"
          );
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {dinner.recipe_text && (
        <ScrollView style={styles.recipeSection}>
          <Card style={styles.recipeCard}>
            <Text style={styles.recipeLabel}>AIレシピ</Text>
            <Text style={styles.recipeText}>{dinner.recipe_text}</Text>
          </Card>
        </ScrollView>
      )}

      <DinnerForm
        initialData={{
          dish_name: dinner.dish_name,
          dinner_date: dinner.dinner_date,
          notes: dinner.notes ?? "",
        }}
        onSubmit={handleSubmit}
        submitLabel="更新する"
        loading={isSaving}
      />

      <View style={styles.deleteContainer}>
        <Button
          title="この履歴を削除"
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
  recipeSection: {
    maxHeight: 200,
    margin: SPACING.md,
    marginBottom: 0,
  },
  recipeCard: {
    backgroundColor: "#FFF8F0",
  },
  recipeLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  recipeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  deleteContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
