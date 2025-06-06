import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface PropertyDetails {
  title?: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  suburb: string;
  city: string;
  province: string;
  price: string;
  features?: string[];
  lotSize?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  hasPool?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  petsAllowed?: boolean;
  furnished?: boolean;
}

interface GeneratedDescription {
  description: string;
  highlights: string[];
  marketingTags: string[];
}

class OpenAIService {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  private model = "gpt-4o";

  async generatePropertyDescription(propertyDetails: PropertyDetails): Promise<GeneratedDescription> {
    try {
      const prompt = this.buildPropertyPrompt(propertyDetails);

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a professional real estate copywriter specializing in the South African property market. Create compelling, accurate property descriptions that highlight key features and appeal to potential buyers. Always include relevant South African context, local amenities, and market positioning. Respond with JSON in this format: { "description": "string", "highlights": ["string"], "marketingTags": ["string"] }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        description: result.description || "Beautiful property in a prime location.",
        highlights: result.highlights || [],
        marketingTags: result.marketingTags || []
      };
    } catch (error) {
      console.error("Error generating property description:", error);
      throw new Error("Failed to generate property description");
    }
  }

  async enhancePropertyDescription(existingDescription: string, propertyDetails: PropertyDetails): Promise<string> {
    try {
      const prompt = `Enhance this existing property description with more compelling language and South African market context:

Existing Description: ${existingDescription}

Property Details:
- Type: ${propertyDetails.propertyType}
- Location: ${propertyDetails.address}, ${propertyDetails.suburb}, ${propertyDetails.city}, ${propertyDetails.province}
- Size: ${propertyDetails.bedrooms} bed, ${propertyDetails.bathrooms} bath, ${propertyDetails.area}m²
- Price: ${propertyDetails.price}

Make it more engaging while keeping all factual information accurate.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a professional real estate copywriter. Enhance property descriptions to be more compelling while maintaining accuracy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 800
      });

      return response.choices[0].message.content || existingDescription;
    } catch (error) {
      console.error("Error enhancing property description:", error);
      throw new Error("Failed to enhance property description");
    }
  }

  async generateMarketingContent(propertyDetails: PropertyDetails): Promise<{
    socialMediaPost: string;
    emailSubject: string;
    tagline: string;
  }> {
    try {
      const prompt = `Create marketing content for this South African property:

Property: ${propertyDetails.propertyType}
Location: ${propertyDetails.suburb}, ${propertyDetails.city}, ${propertyDetails.province}
Size: ${propertyDetails.bedrooms} bed, ${propertyDetails.bathrooms} bath
Price: ${propertyDetails.price}

Generate: social media post (max 280 chars), email subject line, and catchy tagline. Respond in JSON format: { "socialMediaPost": "string", "emailSubject": "string", "tagline": "string" }`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a real estate marketing expert. Create engaging, concise marketing content for South African properties."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        socialMediaPost: result.socialMediaPost || "",
        emailSubject: result.emailSubject || "",
        tagline: result.tagline || ""
      };
    } catch (error) {
      console.error("Error generating marketing content:", error);
      throw new Error("Failed to generate marketing content");
    }
  }

  private buildPropertyPrompt(details: PropertyDetails): string {
    const features = details.features?.join(", ") || "";
    const additionalFeatures = [];
    
    if (details.hasPool) additionalFeatures.push("swimming pool");
    if (details.hasGarden) additionalFeatures.push("garden");
    if (details.hasBalcony) additionalFeatures.push("balcony");
    if (details.petsAllowed) additionalFeatures.push("pet-friendly");
    if (details.furnished) additionalFeatures.push("furnished");

    return `Create a compelling property description for this South African property:

Property Type: ${details.propertyType}
Address: ${details.address}
Location: ${details.suburb}, ${details.city}, ${details.province}
Price: ${details.price}
Bedrooms: ${details.bedrooms}
Bathrooms: ${details.bathrooms}
Floor Area: ${details.area}m²
${details.lotSize ? `Lot Size: ${details.lotSize}m²` : ''}
${details.yearBuilt ? `Year Built: ${details.yearBuilt}` : ''}
${details.parkingSpaces ? `Parking Spaces: ${details.parkingSpaces}` : ''}
${features ? `Features: ${features}` : ''}
${additionalFeatures.length > 0 ? `Additional Features: ${additionalFeatures.join(", ")}` : ''}

Requirements:
- Write in South African English
- Highlight the location benefits and local amenities
- Use compelling, professional language
- Include market positioning appropriate for the price range
- Mention lifestyle benefits
- Keep it engaging but factual
- Target potential buyers for this property type and location

Provide:
1. A detailed description (200-300 words)
2. Key highlights (3-5 bullet points)
3. Marketing tags (5-7 short phrases for advertising)`;
  }
}

export const openaiService = new OpenAIService();
export type { PropertyDetails, GeneratedDescription };