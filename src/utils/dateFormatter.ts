import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return dateString;
  return format(date, "M月d日（E）", { locale: ja });
}

export function formatDateLong(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return dateString;
  return format(date, "yyyy年M月d日（E）", { locale: ja });
}

export function formatDateForInput(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return dateString;
  return format(date, "yyyy-MM-dd");
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = parseISO(expiryDate);
  if (!isValid(expiry)) return Infinity;
  return differenceInDays(expiry, new Date());
}

export function getExpiryStatus(
  expiryDate: string | null
): "ok" | "expiring_soon" | "expired" {
  if (!expiryDate) return "ok";
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 3) return "expiring_soon";
  return "ok";
}
