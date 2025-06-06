import { useQuery } from "@tanstack/react-query";
import type { LeadWithProperty } from "@shared/schema";

interface UseLeadsOptions {
  status?: string;
  agentId?: number;
  propertyId?: number;
  limit?: number;
  offset?: number;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const queryParams = new URLSearchParams();
  
  if (options.status) queryParams.set("status", options.status);
  if (options.agentId !== undefined) queryParams.set("agentId", options.agentId.toString());
  if (options.propertyId !== undefined) queryParams.set("propertyId", options.propertyId.toString());
  if (options.limit !== undefined) queryParams.set("limit", options.limit.toString());
  if (options.offset !== undefined) queryParams.set("offset", options.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/leads${queryString ? `?${queryString}` : ""}`;

  return useQuery<LeadWithProperty[]>({
    queryKey: [endpoint],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useLead(id: number) {
  return useQuery<LeadWithProperty>({
    queryKey: [`/api/leads/${id}`],
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
