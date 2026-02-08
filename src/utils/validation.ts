export function validateDishName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "料理名を入力してください";
  if (trimmed.length > 100) return "料理名は100文字以内で入力してください";
  return null;
}

export function validateIngredientName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "材料名を入力してください";
  if (trimmed.length > 50) return "材料名は50文字以内で入力してください";
  return null;
}

export function validateQuantity(quantity: string): string | null {
  if (quantity.length > 30) return "数量は30文字以内で入力してください";
  return null;
}

export function validateDate(dateString: string): string | null {
  if (!dateString) return null;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return "日付の形式が正しくありません";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "無効な日付です";
  return null;
}
