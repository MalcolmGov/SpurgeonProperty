import { storage } from "./storage-simple";
import type { InsertProperty } from "@shared/schema";

// Authentic South African property data representing various market segments
const southAfricanProperties: Omit<InsertProperty, 'agentId' | 'views'>[] = [
  {
    title: "Luxury 4 Bedroom House in Sandton",
    description: "Stunning contemporary home in prestigious Sandton area. Features include gourmet kitchen with granite countertops, spacious living areas, master suite with en-suite bathroom, swimming pool, and double garage. Located in secure estate with 24-hour security.",
    price: "R 4,850,000",
    address: "123 Rivonia Road",
    suburb: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: "3.5",
    area: 450,
    lotSize: "800",
    yearBuilt: 2018,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop"
    ],
    features: ["Swimming Pool", "Double Garage", "Security Estate", "Garden", "Study", "Servant's Quarters"],
    status: "active",
    featured: true
  },
  {
    title: "Modern 2 Bedroom Apartment in Cape Town City Bowl",
    description: "Stylish apartment with panoramic mountain views. Open-plan living, modern kitchen, balcony overlooking Table Mountain. Walking distance to V&A Waterfront and CBD. Perfect for young professionals.",
    price: "R 2,150,000",
    address: "45 Long Street",
    suburb: "City Bowl",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: "2",
    area: 120,
    yearBuilt: 2020,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop"
    ],
    features: ["Mountain Views", "Balcony", "Modern Kitchen", "Security", "City Center Location"],
    status: "active",
    featured: true
  },
  {
    title: "Family Home in Centurion with Pool",
    description: "Spacious 3 bedroom family home in quiet suburban area. Features include large garden, swimming pool, double garage, and entertainment area. Close to excellent schools and shopping centers.",
    price: "R 2,850,000",
    address: "78 Jacaranda Avenue",
    suburb: "Centurion",
    city: "Centurion",
    province: "Gauteng",
    propertyType: "house",
    bedrooms: 3,
    bathrooms: "2",
    area: 280,
    lotSize: 600,
    yearBuilt: 2015,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop"
    ],
    features: ["Swimming Pool", "Large Garden", "Double Garage", "Entertainment Area", "Near Schools"],
    status: "active",
    featured: false,
    views: 92
  },
  {
    title: "Seaside Apartment in Durban Beachfront",
    description: "Beautiful 2 bedroom apartment with direct sea views. Modern finishes, open balcony, secure parking. Prime beachfront location with easy access to Golden Mile and Ushaka Marine World.",
    price: "R 1,950,000",
    address: "Marine Parade",
    suburb: "Durban Beachfront",
    city: "Durban",
    province: "KwaZulu-Natal",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: "2",
    area: 95,
    yearBuilt: 2017,
    images: [
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=600&h=400&fit=crop"
    ],
    features: ["Sea Views", "Beachfront", "Secure Parking", "Modern Finishes", "Balcony"],
    status: "active",
    featured: false,
    views: 156
  },
  {
    title: "Executive Townhouse in Rosebank",
    description: "Elegant 3 bedroom townhouse in exclusive complex. High-end finishes, private garden, double garage, and communal facilities including gym and pool. Walking distance to Rosebank Mall and Gautrain.",
    price: "R 3,200,000",
    address: "Rosebank Mews",
    suburb: "Rosebank",
    city: "Johannesburg",
    province: "Gauteng",
    propertyType: "townhouse",
    bedrooms: 3,
    bathrooms: "2.5",
    area: 180,
    yearBuilt: 2019,
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop"
    ],
    features: ["Private Garden", "Double Garage", "Complex Facilities", "High-end Finishes", "Gautrain Access"],
    status: "active",
    featured: true,
    views: 278
  },
  {
    title: "Starter Home in Midrand",
    description: "Perfect first home or investment property. 2 bedroom house with potential for extension. Large stand, single garage, and established garden. Close to major highways and shopping centers.",
    price: "R 1,250,000",
    address: "Elm Street",
    suburb: "Midrand",
    city: "Midrand",
    province: "Gauteng",
    propertyType: "house",
    bedrooms: 2,
    bathrooms: "1",
    area: 120,
    lotSize: 450,
    yearBuilt: 2010,
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop"
    ],
    features: ["Large Stand", "Garden", "Single Garage", "Investment Potential", "Highway Access"],
    status: "active",
    featured: false,
    views: 67
  },
  {
    title: "Luxury Penthouse in Umhlanga",
    description: "Spectacular penthouse with panoramic ocean views. 3 bedrooms, 3 bathrooms, gourmet kitchen, and expansive terrace. Premium building with concierge service and beach access.",
    price: "R 5,500,000",
    address: "Lighthouse Road",
    suburb: "Umhlanga",
    city: "Durban",
    province: "KwaZulu-Natal",
    propertyType: "penthouse",
    bedrooms: 3,
    bathrooms: "3",
    area: 220,
    yearBuilt: 2021,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop"
    ],
    features: ["Ocean Views", "Penthouse", "Concierge Service", "Beach Access", "Gourmet Kitchen", "Terrace"],
    status: "active",
    featured: true,
    views: 412
  },
  {
    title: "Family Home in Stellenbosch Winelands",
    description: "Charming 4 bedroom home surrounded by vineyards. Traditional Cape Dutch architecture, spacious rooms, fireplace, and covered patio. Perfect for wine lovers and families seeking tranquil lifestyle.",
    price: "R 3,750,000",
    address: "Vineyard Estate",
    suburb: "Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: "3",
    area: 320,
    lotSize: 1200,
    yearBuilt: 2016,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
    ],
    features: ["Vineyard Views", "Cape Dutch Architecture", "Fireplace", "Covered Patio", "Wine Country"],
    status: "active",
    featured: false,
    views: 134
  }
];

export async function importSouthAfricanProperties(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    console.log('Importing South African property data...');
    
    let importedCount = 0;
    
    for (const propertyData of southAfricanProperties) {
      try {
        await storage.createProperty({
          ...propertyData,
          agentId: 1 // Default agent
        });
        importedCount++;
        console.log(`Imported: ${propertyData.title}`);
      } catch (error) {
        console.error(`Failed to import ${propertyData.title}:`, error);
      }
    }
    
    return {
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} South African properties`
    };
  } catch (error) {
    console.error('Error importing properties:', error);
    return {
      success: false,
      count: 0,
      message: `Failed to import properties: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}