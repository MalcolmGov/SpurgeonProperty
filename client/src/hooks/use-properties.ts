import { useQuery } from "@tanstack/react-query";
import type { PropertyWithAgent } from "@shared/schema";

interface UsePropertiesOptions {
  search?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const queryParams = new URLSearchParams();
  
  if (options.search) queryParams.set("search", options.search);
  if (options.propertyType) queryParams.set("propertyType", options.propertyType);
  if (options.listingType) queryParams.set("listingType", options.listingType);
  if (options.minPrice !== undefined) queryParams.set("minPrice", options.minPrice.toString());
  if (options.maxPrice !== undefined) queryParams.set("maxPrice", options.maxPrice.toString());
  if (options.bedrooms !== undefined) queryParams.set("bedrooms", options.bedrooms.toString());
  if (options.bathrooms !== undefined) queryParams.set("bathrooms", options.bathrooms.toString());
  if (options.city) queryParams.set("city", options.city);
  if (options.status) queryParams.set("status", options.status);
  if (options.featured !== undefined) queryParams.set("featured", options.featured.toString());
  if (options.limit !== undefined) queryParams.set("limit", options.limit.toString());
  if (options.offset !== undefined) queryParams.set("offset", options.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/properties${queryString ? `?${queryString}` : ""}`;

  return useQuery<PropertyWithAgent[]>({
    queryKey: [endpoint],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, especially on mobile
      if (failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'online',
  });
}

export function useProperty(id: number) {
  return useQuery<PropertyWithAgent>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
