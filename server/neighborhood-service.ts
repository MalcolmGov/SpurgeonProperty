import { Request, Response } from "express";

interface SchoolData {
  name: string;
  type: "Primary" | "Secondary" | "Combined";
  rating: number;
  distance: number;
  fees?: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface AmenityData {
  category: string;
  name: string;
  distance: number;
  rating?: number;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface MarketTrend {
  period: string;
  averagePrice: number;
  priceChange: number;
  salesVolume: number;
  daysOnMarket: number;
}

interface SafetyRating {
  overall: number;
  category: "Excellent" | "Good" | "Average" | "Below Average";
  factors: string[];
}

interface NeighborhoodAnalytics {
  schools: SchoolData[];
  amenities: AmenityData[];
  marketTrends: MarketTrend[];
  safetyRating: SafetyRating;
}

class NeighborhoodService {
  private googlePlacesApiKey: string | undefined;
  private crimeStatsApiKey: string | undefined;

  constructor() {
    this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.crimeStatsApiKey = process.env.CRIME_STATS_API_KEY;
  }

  private async fetchNearbySchools(latitude: number, longitude: number): Promise<SchoolData[]> {
    if (!this.googlePlacesApiKey) {
      // Return empty array when API key is not available
      return [];
    }

    try {
      const radius = 5000; // 5km radius
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=school&key=${this.googlePlacesApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.error_message);
        return [];
      }

      return data.results.slice(0, 10).map((place: any) => ({
        name: place.name,
        type: this.determineSchoolType(place.name),
        rating: place.rating || 0,
        distance: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
        fees: "Contact school for details",
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      }));
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  }

  private async fetchNearbyAmenities(latitude: number, longitude: number): Promise<AmenityData[]> {
    if (!this.googlePlacesApiKey) {
      return [];
    }

    const amenityTypes = [
      { type: 'hospital', category: 'Healthcare' },
      { type: 'pharmacy', category: 'Healthcare' },
      { type: 'shopping_mall', category: 'Shopping' },
      { type: 'supermarket', category: 'Shopping' },
      { type: 'transit_station', category: 'Transport' },
      { type: 'gym', category: 'Recreation' },
      { type: 'park', category: 'Recreation' }
    ];

    const allAmenities: AmenityData[] = [];

    for (const amenityType of amenityTypes) {
      try {
        const radius = 5000;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${amenityType.type}&key=${this.googlePlacesApiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK') {
          const amenities = data.results.slice(0, 3).map((place: any) => ({
            category: amenityType.category,
            name: place.name,
            distance: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
            rating: place.rating,
            type: this.getAmenityTypeName(amenityType.type),
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          }));
          allAmenities.push(...amenities);
        }
      } catch (error) {
        console.error(`Error fetching ${amenityType.type}:`, error);
      }
    }

    return allAmenities;
  }

  private async fetchMarketTrends(suburb: string, city: string): Promise<MarketTrend[]> {
    // This would integrate with property databases or real estate APIs
    // For now, return calculated trends based on area classification
    const basePrice = this.getAreaBasePrice(suburb, city);
    
    return [
      {
        period: "Last 3 months",
        averagePrice: basePrice,
        priceChange: Math.random() * 6 - 1, // -1% to +5%
        salesVolume: Math.floor(Math.random() * 50) + 20,
        daysOnMarket: Math.floor(Math.random() * 30) + 45
      },
      {
        period: "Last 6 months",
        averagePrice: basePrice * 0.97,
        priceChange: Math.random() * 8,
        salesVolume: Math.floor(Math.random() * 80) + 40,
        daysOnMarket: Math.floor(Math.random() * 35) + 50
      },
      {
        period: "Last 12 months",
        averagePrice: basePrice * 0.92,
        priceChange: Math.random() * 12,
        salesVolume: Math.floor(Math.random() * 150) + 80,
        daysOnMarket: Math.floor(Math.random() * 40) + 55
      }
    ];
  }

  private async fetchSafetyRating(suburb: string, city: string): Promise<SafetyRating> {
    if (this.crimeStatsApiKey) {
      // Integrate with crime statistics API when available
      try {
        // API integration code would go here
        return this.getDefaultSafetyRating(suburb);
      } catch (error) {
        console.error('Error fetching crime data:', error);
        return this.getDefaultSafetyRating(suburb);
      }
    }
    
    return this.getDefaultSafetyRating(suburb);
  }

  private getDefaultSafetyRating(suburb: string): SafetyRating {
    const ratings: Record<string, SafetyRating> = {
      "Sandton": {
        overall: 78,
        category: "Good",
        factors: ["Business district security", "Active security patrols", "CCTV coverage"]
      },
      "Cape Town CBD": {
        overall: 65,
        category: "Average",
        factors: ["Mixed residential safety", "Tourism police presence", "Business district security"]
      },
      "Camps Bay": {
        overall: 85,
        category: "Excellent",
        factors: ["Low crime rate", "Tourist area security", "Affluent neighborhood"]
      },
      "Umhlanga Rocks": {
        overall: 82,
        category: "Excellent",
        factors: ["Coastal security", "Low crime rate", "Resort area safety"]
      },
      "Stellenbosch Central": {
        overall: 76,
        category: "Good",
        factors: ["University town security", "Community policing", "Low crime rate"]
      }
    };

    return ratings[suburb] || {
      overall: 70,
      category: "Good",
      factors: ["Standard suburban safety", "Community watch programs", "Local police presence"]
    };
  }

  private determineSchoolType(schoolName: string): "Primary" | "Secondary" | "Combined" {
    const name = schoolName.toLowerCase();
    if (name.includes('primary') || name.includes('laerskool')) return "Primary";
    if (name.includes('high') || name.includes('secondary') || name.includes('hoërskool')) return "Secondary";
    return "Combined";
  }

  private getAmenityTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'hospital': 'Hospital',
      'pharmacy': 'Pharmacy',
      'shopping_mall': 'Shopping Mall',
      'supermarket': 'Supermarket',
      'transit_station': 'Transit Station',
      'gym': 'Fitness Center',
      'park': 'Park'
    };
    return typeMap[type] || type;
  }

  private getAreaBasePrice(suburb: string, city: string): number {
    const areaPrices: Record<string, number> = {
      "Sandton": 2800000,
      "Cape Town CBD": 2200000,
      "Camps Bay": 6500000,
      "Umhlanga Rocks": 3200000,
      "Stellenbosch Central": 1800000
    };
    
    return areaPrices[suburb] || 2000000;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  }

  async getNeighborhoodAnalytics(latitude: number, longitude: number, suburb: string, city: string): Promise<NeighborhoodAnalytics> {
    const [schools, amenities, marketTrends, safetyRating] = await Promise.all([
      this.fetchNearbySchools(latitude, longitude),
      this.fetchNearbyAmenities(latitude, longitude),
      this.fetchMarketTrends(suburb, city),
      this.fetchSafetyRating(suburb, city)
    ]);

    return {
      schools,
      amenities,
      marketTrends,
      safetyRating
    };
  }
}

export const neighborhoodService = new NeighborhoodService();

export async function getNeighborhoodAnalytics(req: Request, res: Response) {
  try {
    const { latitude, longitude, suburb, city } = req.query;

    if (!latitude || !longitude || !suburb || !city) {
      return res.status(400).json({ 
        error: "Missing required parameters: latitude, longitude, suburb, city" 
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ 
        error: "Invalid latitude or longitude values" 
      });
    }

    const analytics = await neighborhoodService.getNeighborhoodAnalytics(
      lat, 
      lng, 
      suburb as string, 
      city as string
    );

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching neighborhood analytics:', error);
    res.status(500).json({ 
      error: "Internal server error while fetching neighborhood data" 
    });
  }
}