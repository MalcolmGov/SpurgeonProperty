import Anthropic from '@anthropic-ai/sdk';

interface ChatQuery {
  message: string;
  context?: any;
  conversationHistory?: any[];
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

interface ChatResponse {
  response: string;
  searchQuery?: string;
  filters?: SearchFilters;
  propertyData?: any;
  suggestions?: string[];
  intent: string;
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

  async processChat(chatQuery: ChatQuery): Promise<ChatResponse> {
    try {
      const prompt = this.buildChatPrompt(chatQuery);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: `You are Emma, a professional South African real estate assistant. You help clients find properties, understand neighborhoods, calculate mortgages, and navigate the property market. Always be helpful, knowledgeable about South African property market, and provide actionable advice. Respond conversationally but professionally.`
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }
      
      // Try to parse JSON response, fallback to plain text
      let result;
      try {
        result = JSON.parse((content as any).text);
      } catch {
        result = {
          response: (content as any).text,
          intent: 'general'
        };
      }
      
      return {
        response: result.response || (content as any).text,
        searchQuery: result.searchQuery,
        filters: result.filters ? this.validateFilters(result.filters) : undefined,
        propertyData: result.propertyData,
        suggestions: result.suggestions || this.getContextualSuggestions(chatQuery.message),
        intent: result.intent || 'general'
      };

    } catch (error) {
      console.error('Anthropic chat processing error:', error);
      
      return this.fallbackChatResponse(chatQuery.message);
    }
  }

  private buildChatPrompt(chatQuery: ChatQuery): string {
    const conversationContext = chatQuery.conversationHistory 
      ? chatQuery.conversationHistory.slice(-3).map(msg => 
          `${msg.type}: ${msg.content}`
        ).join('\n')
      : '';

    const propertyContext = chatQuery.context 
      ? `Current property context: ${JSON.stringify(chatQuery.context)}`
      : '';

    return `
You are Emma, a professional South African real estate assistant. Respond to this client message naturally and helpfully.

${conversationContext ? `Recent conversation:\n${conversationContext}\n` : ''}
${propertyContext ? `${propertyContext}\n` : ''}

Client message: "${chatQuery.message}"

Respond in a conversational, helpful manner. If the client is asking about property searches, neighborhoods, financing, or specific properties, provide relevant information and guidance.

If the message suggests they want to search for properties, you can optionally include search parameters in JSON format at the end of your response like this:
SEARCH_DATA: {"searchQuery": "search terms", "filters": {"propertyType": "house", "maxPrice": 2000000, "bedrooms": 3}}

South African Context:
- Currency: South African Rand (ZAR/R)
- Major cities: Johannesburg, Cape Town, Durban, Pretoria
- Popular suburbs: Sandton, Camps Bay, Umhlanga, Centurion, Stellenbosch
- Property types: House, apartment, townhouse, cluster home, security estate
- Common features: Pool, braai area, domestic quarters, borehole, solar power
- Price ranges typically: R500k - R50M depending on area and type
- Interest rates currently around 11-12% for home loans
- Transfer duties and bond registration costs apply

Provide helpful, accurate advice about the South African property market.
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

  private getContextualSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking')) {
      return [
        "Show me houses under R2 million",
        "Find apartments in Sandton",
        "Search for family homes with pools",
        "What's available in Cape Town?"
      ];
    }
    
    if (lowerMessage.includes('mortgage') || lowerMessage.includes('finance') || lowerMessage.includes('loan')) {
      return [
        "Calculate mortgage for R1.5 million",
        "What are current interest rates?",
        "How much can I afford to spend?",
        "Explain transfer duties and costs"
      ];
    }
    
    if (lowerMessage.includes('area') || lowerMessage.includes('neighborhood') || lowerMessage.includes('location')) {
      return [
        "Tell me about Sandton schools",
        "What's the crime rate in this area?",
        "Best family neighborhoods in Johannesburg",
        "Investment potential of this location"
      ];
    }
    
    return [
      "Find properties in my budget",
      "Tell me about this neighborhood",
      "Calculate my mortgage options",
      "What should I know about buying property?"
    ];
  }

  private fallbackChatResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    let response = "I understand you're interested in property assistance. ";
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      response += "I can help you search for properties. Try asking me something like 'Find 3 bedroom houses under R2 million in Sandton' or tell me about your specific requirements.";
    } else if (lowerMessage.includes('mortgage') || lowerMessage.includes('finance')) {
      response += "I can help with mortgage calculations and financing questions. Feel free to ask about interest rates, affordability, or monthly payments.";
    } else if (lowerMessage.includes('area') || lowerMessage.includes('neighborhood')) {
      response += "I can provide information about different areas, schools, amenities, and market trends. Which area are you interested in learning about?";
    } else {
      response += "I can help you with property searches, neighborhood information, mortgage calculations, and general real estate advice. What would you like to know?";
    }
    
    return {
      response,
      intent: 'general',
      suggestions: this.getContextualSuggestions(message)
    };
  }
}

export const anthropicService = new AnthropicService();