export function toMoney(value: { toString(): string } | number | string) {
  return Number(value);
}

export function formatNgn(value: { toString(): string } | number | string) {
  const formatted = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(toMoney(value));
  return `₦\u202F${formatted}`;
}

export function subscriptionAmount() {
  const parsed = Number(process.env.SUBSCRIPTION_AMOUNT_NGN ?? "5000");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5000;
}

export function subscriptionDays() {
  const parsed = Number(process.env.SUBSCRIPTION_DAYS ?? "30");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}
