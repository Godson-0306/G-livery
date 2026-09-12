export type PayoutDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export function parsePayoutDetails(formData: FormData): PayoutDetails | { error: string } {
  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").replace(/\s/g, "");

  if (bankName.length < 2) return { error: "Enter the bank name." };
  if (accountName.length < 2) return { error: "Enter the name on the account." };
  if (!/^\d{10}$/.test(accountNumber)) {
    return { error: "Account number must be 10 digits." };
  }

  return { bankName, accountName, accountNumber };
}

export function hasPayoutDetails(details?: {
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
} | null) {
  if (!details) return false;
  return (
    (details.bankName ?? "").trim().length > 1 &&
    (details.accountName ?? "").trim().length > 1 &&
    /^\d{10}$/.test((details.accountNumber ?? "").replace(/\s/g, ""))
  );
}
