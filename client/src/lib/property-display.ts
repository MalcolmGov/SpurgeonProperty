/** Property types that should not show bedroom/bathroom counts. */
const NON_RESIDENTIAL_PROPERTY_TYPES = new Set([
  "commercial",
  "land",
  "vacant_land",
]);

export function normalizePropertyType(
  propertyType: string | null | undefined
): string {
  return (propertyType ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

/** Residential listings show beds/baths; commercial and land do not. */
export function showsBedroomsAndBathrooms(
  propertyType: string | null | undefined
): boolean {
  const type = normalizePropertyType(propertyType);
  if (!type) return true;
  return !NON_RESIDENTIAL_PROPERTY_TYPES.has(type);
}

const RESIDENTIAL_FEATURE_PATTERN =
  /\b(bedroom|bathroom|bed|bath|single\s+bedroom|en[\s-]?suite)\b/i;

/** Hide bedroom/bathroom-style feature tags on commercial and land listings. */
export function filterPropertyFeatures(
  features: string[] | null | undefined,
  propertyType: string | null | undefined
): string[] {
  if (!features?.length) return [];
  if (showsBedroomsAndBathrooms(propertyType)) return features;
  return features.filter((f) => !RESIDENTIAL_FEATURE_PATTERN.test(f));
}

export function isCommercialProperty(
  propertyType: string | null | undefined
): boolean {
  return normalizePropertyType(propertyType) === "commercial";
}
