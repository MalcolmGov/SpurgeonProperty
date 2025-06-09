import Anthropic from '@anthropic-ai/sdk';

interface VoiceSearchQuery {
  query: string;
  confidence: number;
}

interface SearchFilters {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  suburb?: string;
  city?: string;
  province?: string;
  features?: string[];
}

interface ProcessedVoiceSearch {
  searchQuery: string;
  filters: SearchFilters;
  intent: string;
  extractedEntities: any;
}

class AnthropicService {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async processVoiceSearch(voiceQuery: VoiceSearchQuery): Promise<ProcessedVoiceSearch> {
    try {
      const prompt = this.buildVoiceSearchPrompt(voiceQuery.query);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: `You are a South African real estate search AI assistant. Process voice commands into structured property search queries with appropriate filters for the South African market. Always respond in valid JSON format.`
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }
      const result = JSON.parse((content as any).text);
      
      return {
        searchQuery: result.searchQuery || voiceQuery.query,
        filters: this.validateFilters(result.filters || {}),
        intent: result.intent || 'search',
        extractedEntities: result.extractedEntities || {}
      };

    } catch (error) {
      console.error('Anthropic processing error:', error);
      
      // Fallback processing using basic text analysis
      return this.fallbackProcessing(voiceQuery.query);
    }
  }

  private buildVoiceSearchPrompt(query: string): string {
    return `
Analyze this South African property search voice command and extract structured information:

Voice Input: "${query}"

Extract and return a JSON response with the following structure:
{
  "searchQuery": "cleaned search terms for property search",
  "filters": {
    "propertyType": "house|apartment|townhouse|flat|cluster_home|farm|vacant_land",
    "minPrice": number (in ZAR),
    "maxPrice": number (in ZAR),
    "bedrooms": number,
    "bathrooms": number,
    "suburb": "suburb name",
    "city": "city name", 
    "province": "Gauteng|Western Cape|KwaZulu-Natal|Eastern Cape|Free State|Limpopo|Mpumalanga|North West|Northern Cape",
    "features": ["pool", "garden", "garage", "security", "pet_friendly", "furnished", etc.]
  },
  "intent": "search|buy|rent|sell|view",
  "extractedEntities": {
    "priceTerms": ["under 2 million", "between 1.5M and 3M"],
    "locationTerms": ["Sandton", "Cape Town", "Durban"],
    "propertyFeatures": ["pool", "double garage"],
    "urgency": "low|medium|high"
  }
}

South African Context:
- Currency: South African Rand (ZAR/R)
- Common price formats: "2 million", "2M", "R2,000,000", "under 3 mil"
- Major cities: Johannesburg, Cape Town, Durban, Pretoria, Port Elizabeth
- Popular suburbs: Sandton, Camps Bay, Umhlanga, Centurion, Stellenbosch
- Property types: House, apartment, townhouse, cluster home, security estate
- Common features: Pool, braai area, domestic quarters, borehole, solar power

Extract price ranges intelligently:
- "under 2 million" = maxPrice: 2000000
- "between 1.5 and 3 million" = minPrice: 1500000, maxPrice: 3000000
- "around 2 million" = minPrice: 1800000, maxPrice: 2200000
- "budget of 1.5M" = maxPrice: 1500000

Only include filters that are explicitly mentioned or strongly implied in the voice input.
`;
  }

  private validateFilters(filters: any): SearchFilters {
    const validatedFilters: SearchFilters = {};

    // Validate property type
    const validPropertyTypes = ['house', 'apartment', 'townhouse', 'flat', 'cluster_home', 'farm', 'vacant_land'];
    if (filters.propertyType && validPropertyTypes.includes(filters.propertyType)) {
      validatedFilters.propertyType = filters.propertyType;
    }

    // Validate price ranges (in ZAR)
    if (filters.minPrice && typeof filters.minPrice === 'number' && filters.minPrice > 0) {
      validatedFilters.minPrice = Math.max(filters.minPrice, 100000); // Minimum R100k
    }
    if (filters.maxPrice && typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
      validatedFilters.maxPrice = Math.min(filters.maxPrice, 100000000); // Maximum R100M
    }

    // Validate bedrooms/bathrooms
    if (filters.bedrooms && typeof filters.bedrooms === 'number' && filters.bedrooms >= 1 && filters.bedrooms <= 10) {
      validatedFilters.bedrooms = filters.bedrooms;
    }
    if (filters.bathrooms && typeof filters.bathrooms === 'number' && filters.bathrooms >= 1 && filters.bathrooms <= 10) {
      validatedFilters.bathrooms = filters.bathrooms;
    }

    // Validate location fields
    if (filters.suburb && typeof filters.suburb === 'string') {
      validatedFilters.suburb = filters.suburb.trim();
    }
    if (filters.city && typeof filters.city === 'string') {
      validatedFilters.city = filters.city.trim();
    }

    // Validate province
    const validProvinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
    if (filters.province && validProvinces.includes(filters.province)) {
      validatedFilters.province = filters.province;
    }

    // Validate features
    if (filters.features && Array.isArray(filters.features)) {
      const validFeatures = ['pool', 'garden', 'garage', 'security', 'pet_friendly', 'furnished', 'braai_area', 'domestic_quarters', 'borehole', 'solar_power'];
      validatedFilters.features = filters.features.filter((feature: string) => 
        validFeatures.includes(feature)
      );
    }

    return validatedFilters;
  }

  private fallbackProcessing(query: string): ProcessedVoiceSearch {
    const lowerQuery = query.toLowerCase();
    const filters: SearchFilters = {};
    
    // Basic price extraction
    const priceMatches = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:million|mil|m|k|thousand)/gi);
    if (priceMatches) {
      const price = parseFloat(priceMatches[0]);
      if (lowerQuery.includes('under') || lowerQuery.includes('below')) {
        filters.maxPrice = price * (priceMatches[0].includes('million') || priceMatches[0].includes('mil') || priceMatches[0].includes('m') ? 1000000 : 1000);
      }
    }

    // Basic bedroom extraction
    const bedroomMatch = lowerQuery.match(/(\d+)\s*bedroom/);
    if (bedroomMatch) {
      filters.bedrooms = parseInt(bedroomMatch[1]);
    }

    // Basic property type extraction
    if (lowerQuery.includes('house')) filters.propertyType = 'house';
    else if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) filters.propertyType = 'apartment';
    else if (lowerQuery.includes('townhouse')) filters.propertyType = 'townhouse';

    // Basic location extraction
    const southAfricanCities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'sandton', 'centurion'];
    for (const city of southAfricanCities) {
      if (lowerQuery.includes(city)) {
        filters.city = city;
        break;
      }
    }

    return {
      searchQuery: query,
      filters,
      intent: 'search',
      extractedEntities: {}
    };
  }
}

export const anthropicService = new AnthropicService();