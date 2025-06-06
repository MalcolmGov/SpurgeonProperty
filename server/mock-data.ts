import type { PropertyWithAgent } from "@shared/schema";

// Mock property data for demonstration purposes
export const mockProperties: PropertyWithAgent[] = [
  {
    id: 11,
    title: "Luxurious Family Home in Sandton",
    description: "Beautiful 4-bedroom family home with modern finishes, spacious living areas, and a stunning garden. Perfect for entertaining and family living.",
    price: "2850000",
    address: "15 Wisteria Lane",
    suburb: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: "3.5",
    area: 350,
    lotSize: "1200",
    yearBuilt: 2018,
    parking: "Double garage",
    features: ["Swimming Pool", "Garden", "Security", "Modern Kitchen", "Study"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ],
    status: "active",
    agentId: 1,
    featured: true,
    views: 45,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    agent: {
      id: 1,
      name: "Sarah Williams",
      email: "sarah@realestate.com",
      phone: "+27 82 123 4567",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b89298aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      bio: "Experienced real estate agent specializing in luxury properties in Sandton and surrounding areas.",
      specialties: ["Luxury Homes", "Investment Properties", "Commercial"],
      rating: "4.8",
      totalSales: 127,
      createdAt: new Date("2020-03-01")
    }
  },
  {
    id: 12,
    title: "Modern Apartment in Cape Town CBD",
    description: "Stunning 2-bedroom apartment with panoramic city and mountain views. Located in the heart of Cape Town with easy access to all amenities.",
    price: "1950000",
    address: "88 Loop Street",
    suburb: "Cape Town CBD",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: "2.0",
    area: 120,
    lotSize: null,
    yearBuilt: 2020,
    parking: "One covered parking",
    features: ["City Views", "Mountain Views", "Balcony", "Modern Finishes", "Security"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ],
    status: "active",
    agentId: 2,
    featured: false,
    views: 28,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    agent: {
      id: 2,
      name: "Michael Thompson",
      email: "michael@realestate.com",
      phone: "+27 83 987 6543",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      bio: "Cape Town specialist with expertise in urban properties and investment opportunities.",
      specialties: ["Urban Living", "Apartments", "Investment"],
      rating: "4.6",
      totalSales: 89,
      createdAt: new Date("2019-08-15")
    }
  }
];

export function getMockProperty(id: number): PropertyWithAgent | undefined {
  return mockProperties.find(property => property.id === id);
}

export function getMockProperties(): PropertyWithAgent[] {
  return mockProperties;
}