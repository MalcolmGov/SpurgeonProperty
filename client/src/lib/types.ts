export interface SearchFilters {
  search?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  status?: string;
  featured?: boolean;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface SortOptions {
  field?: string;
  direction?: "asc" | "desc";
}

export interface PropertySearchParams extends SearchFilters, PaginationOptions, SortOptions {}

export interface LeadFilters {
  status?: string;
  agentId?: number;
  propertyId?: number;
  priority?: string;
}

export interface LeadSearchParams extends LeadFilters, PaginationOptions, SortOptions {}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType: "info_request" | "viewing" | "offer";
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  lotSize?: string;
  yearBuilt?: string;
  parking?: string;
  features: string[];
  images: string[];
  status: string;
  agentId?: string;
  featured: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export type ViewMode = "grid" | "list";

export type PropertyStatus = "active" | "pending" | "sold" | "rented";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export type LeadPriority = "low" | "medium" | "high";

export type InquiryType = "viewing" | "info_request" | "offer";
