import { z } from 'zod';

// Comprehensive validation schemas for production

export const PropertySearchSchema = z.object({
  search: z.string().optional(),
  propertyType: z.enum(['all', 'house', 'apartment', 'townhouse', 'villa', 'estate', 'farm', 'land', 'commercial']).optional(),
  listingType: z.enum(['all', 'sale', 'rent']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  featured: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  propertyId: z.number().positive().optional(),
  inquiryType: z.enum(['viewing', 'info', 'financing', 'negotiation']).optional(),
  preferredContact: z.enum(['phone', 'email', 'whatsapp']).optional(),
  contactTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']).optional()
});

export const PropertyFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  price: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200),
  suburb: z.string().min(2, 'Suburb is required').max(100),
  city: z.string().min(2, 'City is required').max(100),
  province: z.string().min(2, 'Province is required').max(100),
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters').max(10),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'villa', 'estate', 'farm', 'land', 'commercial']),
  listingType: z.enum(['sale', 'rent']).default('sale'),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  area: z.number().min(1, 'Floor area is required'),
  lotSize: z.number().min(0).optional(),
  lotSizeUnit: z.enum(['sqm', 'acres']).default('sqm'),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear() + 2).optional(),
  agentId: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  customFeatures: z.array(z.string()).default([]),
  additionalInfo: z.string().max(1000).optional(),
  monthlyRates: z.string().optional(),
  monthlyLevies: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const AdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const AgentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  title: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).default([]),
  licenseNumber: z.string().max(50).optional(),
  yearsExperience: z.number().min(0).max(50).optional()
});

// File upload validation
export const ImageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a valid image format (JPEG, PNG, WebP)'
    )
});

export const VideoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 100 * 1024 * 1024, 'Video size must be less than 100MB')
    .refine(
      file => ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'].includes(file.type),
      'File must be a valid video format'
    )
});

// Utility functions for validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // South African phone number validation
  const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  return saPhoneRegex.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validatePrice(price: string): boolean {
  const numericPrice = price.replace(/[^\d]/g, '');
  const parsedPrice = parseInt(numericPrice);
  return !isNaN(parsedPrice) && parsedPrice > 0;
}

export function validateCoordinates(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return true; // Optional coordinates
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}