/** True when listing should show Price on Application instead of a numeric amount. */
export function isPriceOnApplication(price: string | null | undefined): boolean {
  if (price == null) return true;

  const normalized = price.toString().trim().toLowerCase();
  if (
    !normalized ||
    normalized === "null" ||
    normalized === "undefined"
  ) {
    return true;
  }

  if (
    normalized === "poa" ||
    normalized === "p.o.a." ||
    normalized === "p.o.a"
  ) {
    return true;
  }

  if (normalized.includes("price on application")) {
    return true;
  }

  if (normalized === "0") {
    return true;
  }

  const digitsOnly = normalized.replace(/[^\d.]/g, "");
  if (!digitsOnly) {
    return true;
  }

  const numeric = parseFloat(digitsOnly);
  return !Number.isNaN(numeric) && numeric === 0;
}

/** Display price for cards, detail pages, and admin tables. */
export function formatPropertyPrice(price: string | null | undefined): string {
  if (isPriceOnApplication(price)) {
    return "POA";
  }

  const str = price!.toString().trim();

  if (str.startsWith("R")) {
    return str;
  }

  const numericPrice = parseFloat(str.replace(/[^\d.]/g, ""));
  if (Number.isNaN(numericPrice)) {
    return "POA";
  }

  return `R ${new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice)}`;
}

/** Value for numeric price inputs when editing a listing. */
export function priceInputValueFromStored(price: string | null | undefined): string {
  if (isPriceOnApplication(price)) {
    return "";
  }
  const digits = price!.toString().replace(/[^\d]/g, "");
  return digits;
}

/** Stored value sent to the API. */
export function normalizePropertyPriceForSave(
  price: string,
  isPoa: boolean
): string {
  if (isPoa) {
    return "POA";
  }
  const trimmed = price.trim();
  return trimmed || "POA";
}
