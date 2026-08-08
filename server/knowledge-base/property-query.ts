import { db } from "../db";
import { properties, agents } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { PropertyWithAgent } from "@shared/schema";

// property_type values actually used in the DB (see shared/schema.ts comment
// + observed data): house, apartment, townhouse, flat, cluster_home, farm,
// vacant_land, commercial. Villa/studio/duplex/penthouse are surfaced in the
// UI as synonyms for these under the hood.
const PROPERTY_TYPE_ALIASES: Record<string, string> = {
  house: "house", houses: "house", home: "house", homes: "house", villa: "house", villas: "house",
  apartment: "apartment", apartments: "apartment", "flat": "flat", "flats": "flat",
  townhouse: "townhouse", townhouses: "townhouse", duplex: "townhouse", penthouse: "apartment",
  cluster: "cluster_home", "cluster home": "cluster_home", "cluster homes": "cluster_home",
  farm: "farm", farms: "farm", smallholding: "farm",
  land: "vacant_land", "vacant land": "vacant_land", plot: "vacant_land", stand: "vacant_land",
  commercial: "commercial", office: "commercial", warehouse: "commercial", industrial: "commercial",
  studio: "apartment",
};

const PROPERTY_SEARCH_TRIGGERS = [
  "find", "show me", "looking for", "search", "browse",
  "property", "properties", "house", "houses", "apartment", "apartments",
  "townhouse", "townhouses", "flat", "flats", "listing", "listings",
  "rent", "rental", "renting", "buy", "buying", "purchase", "for sale",
  "bedroom", "bedrooms", "available", "how many properties", "do you have",
];

interface ParsedFilters {
  bedrooms?: number;
  minBedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  listingType?: "sale" | "rent";
  city?: string;
  suburb?: string;
}

interface PropertyQueryResult {
  isPropertyQuery: boolean;
  filters: ParsedFilters;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase();
  const match = cleaned.match(/^r?\s*([\d.]+)\s*(million|mil|m|k)?$/);
  if (!match) return NaN;
  let value = parseFloat(match[1]);
  if (match[2] === "million" || match[2] === "mil" || match[2] === "m") value *= 1_000_000;
  else if (match[2] === "k") value *= 1_000;
  return value;
}

let locationCache: { cities: string[]; suburbs: string[]; expiresAt: number } | null = null;
const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;

async function getKnownLocations(): Promise<{ cities: string[]; suburbs: string[] }> {
  if (locationCache && locationCache.expiresAt > Date.now()) {
    return locationCache;
  }
  const rows = await db
    .select({ city: properties.city, suburb: properties.suburb })
    .from(properties)
    .where(eq(properties.status, "active"));

  const cities = Array.from(new Set(rows.map((r) => r.city).filter(Boolean)));
  const suburbs = Array.from(new Set(rows.map((r) => r.suburb).filter(Boolean)));
  locationCache = { cities, suburbs, expiresAt: Date.now() + LOCATION_CACHE_TTL_MS };
  return locationCache;
}

export async function parsePropertyQuery(message: string): Promise<PropertyQueryResult> {
  const lower = message.toLowerCase();
  const filters: ParsedFilters = {};

  const bedroomMatch = lower.match(/(\d+)\s*\+?\s*(?:bed|bedroom)s?\b/);
  if (bedroomMatch) {
    const n = parseInt(bedroomMatch[1], 10);
    if (lower.includes(`${bedroomMatch[1]}+`)) filters.minBedrooms = n;
    else filters.bedrooms = n;
  }

  const bathroomMatch = lower.match(/(\d+)\s*\+?\s*(?:bath|bathroom)s?\b/);
  if (bathroomMatch) {
    filters.bathrooms = parseInt(bathroomMatch[1], 10);
  }

  const underMatch = lower.match(/(?:under|below|less than|up to|max(?:imum)?(?: of)?)\s*r?\s*([\d.,]+\s*(?:million|mil|m|k)?)/);
  if (underMatch) {
    const amount = parseAmount(underMatch[1]);
    if (!isNaN(amount)) filters.maxPrice = amount;
  }

  const overMatch = lower.match(/(?:over|above|more than|min(?:imum)?(?: of)?)\s*r?\s*([\d.,]+\s*(?:million|mil|m|k)?)/);
  if (overMatch) {
    const amount = parseAmount(overMatch[1]);
    if (!isNaN(amount)) filters.minPrice = amount;
  }

  const betweenMatch = lower.match(/between\s*r?\s*([\d.,]+\s*(?:million|mil|m|k)?)\s*(?:and|-|to)\s*r?\s*([\d.,]+\s*(?:million|mil|m|k)?)/);
  if (betweenMatch) {
    const min = parseAmount(betweenMatch[1]);
    const max = parseAmount(betweenMatch[2]);
    if (!isNaN(min)) filters.minPrice = min;
    if (!isNaN(max)) filters.maxPrice = max;
  }

  if (/\b(rent|rental|renting|to let|for let)\b/.test(lower)) {
    filters.listingType = "rent";
  } else if (/\b(buy|buying|purchase|for sale|to sale)\b/.test(lower)) {
    filters.listingType = "sale";
  }

  for (const [alias, canonical] of Object.entries(PROPERTY_TYPE_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`).test(lower)) {
      filters.propertyType = canonical;
      break;
    }
  }

  const { cities, suburbs } = await getKnownLocations();
  const sortedSuburbs = [...suburbs].sort((a, b) => b.length - a.length);
  const sortedCities = [...cities].sort((a, b) => b.length - a.length);

  for (const suburb of sortedSuburbs) {
    if (lower.includes(suburb.toLowerCase())) {
      filters.suburb = suburb;
      break;
    }
  }
  if (!filters.suburb) {
    for (const city of sortedCities) {
      if (lower.includes(city.toLowerCase())) {
        filters.city = city;
        break;
      }
    }
  }

  const hasTrigger = PROPERTY_SEARCH_TRIGGERS.some((t) => lower.includes(t));
  const hasExtractedFilter = Object.keys(filters).length > 0;

  return {
    isPropertyQuery: hasTrigger || hasExtractedFilter,
    filters,
  };
}

let propertyCache: { rows: PropertyWithAgent[]; expiresAt: number } | null = null;
const PROPERTY_CACHE_TTL_MS = 30 * 1000;

async function getActiveProperties(): Promise<PropertyWithAgent[]> {
  if (propertyCache && propertyCache.expiresAt > Date.now()) {
    return propertyCache.rows;
  }
  const rows = await db
    .select({ property: properties, agent: agents })
    .from(properties)
    .leftJoin(agents, eq(properties.agentId, agents.id))
    .where(eq(properties.status, "active"));

  const mapped = rows.map((r) => ({ ...r.property, agent: r.agent || undefined })) as PropertyWithAgent[];
  propertyCache = { rows: mapped, expiresAt: Date.now() + PROPERTY_CACHE_TTL_MS };
  return mapped;
}

function priceAsNumber(price: string): number | null {
  const n = parseFloat(price.replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
}

export async function findProperties(filters: ParsedFilters): Promise<{ results: PropertyWithAgent[]; totalActive: number }> {
  const all = await getActiveProperties();

  const filtered = all.filter((p) => {
    if (filters.listingType && p.listingType !== filters.listingType) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
    if (filters.bedrooms !== undefined && p.bedrooms !== filters.bedrooms) return false;
    if (filters.minBedrooms !== undefined && p.bedrooms < filters.minBedrooms) return false;
    if (filters.bathrooms !== undefined) {
      const bath = parseFloat(p.bathrooms);
      if (isNaN(bath) || bath < filters.bathrooms) return false;
    }
    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.suburb && p.suburb.toLowerCase() !== filters.suburb.toLowerCase()) return false;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceNum = priceAsNumber(p.price);
      if (priceNum === null) return false;
      if (filters.minPrice !== undefined && priceNum < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && priceNum > filters.maxPrice) return false;
    }

    return true;
  });

  filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return { results: filtered.slice(0, 6), totalActive: all.length };
}

function formatPrice(price: string): string {
  const n = priceAsNumber(price);
  return n !== null ? `R${n.toLocaleString()}` : price;
}

export function formatPropertyResponse(
  results: PropertyWithAgent[],
  filters: ParsedFilters,
  totalActive: number
): string {
  if (results.length === 0) {
    const criteria: string[] = [];
    if (filters.bedrooms) criteria.push(`${filters.bedrooms} bedroom`);
    if (filters.propertyType) criteria.push(filters.propertyType.replace("_", " "));
    if (filters.suburb) criteria.push(`in ${filters.suburb}`);
    else if (filters.city) criteria.push(`in ${filters.city}`);
    if (filters.listingType === "rent") criteria.push("for rent");
    if (filters.listingType === "sale") criteria.push("for sale");

    const criteriaText = criteria.length > 0 ? ` matching ${criteria.join(" ")}` : "";
    return `I couldn't find any properties${criteriaText} right now. We currently have ${totalActive} active listings - try widening your search (a different area, price range, or bedroom count) and I'll take another look.`;
  }

  const lines = results.map((p) => {
    const bedBath = p.bedrooms ? `${p.bedrooms} bed, ${p.bathrooms} bath • ` : "";
    return `• ${p.title} - ${formatPrice(p.price)}${p.listingType === "rent" ? "/month" : ""} - ${bedBath}${p.suburb}, ${p.city}`;
  });

  const intro = results.length === 1
    ? "I found 1 property matching your search:"
    : `I found ${results.length} propert${results.length === 1 ? "y" : "ies"} matching your search${totalActive > results.length ? ` (out of ${totalActive} active listings)` : ""}:`;

  return `${intro}\n\n${lines.join("\n")}`;
}
