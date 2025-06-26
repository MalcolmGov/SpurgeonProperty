import OpenAI from "openai";
import { Property } from "../shared/schema.js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface SocialAdConfig {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  size: 'square' | 'story' | 'feed' | 'banner';
  style: 'modern' | 'luxury' | 'minimalist' | 'vibrant';
}

interface GeneratedAd {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  targetAudience: string;
}

export class SocialAdGenerator {
  
  async generatePropertyAd(property: Property, config: SocialAdConfig): Promise<GeneratedAd> {
    try {
      console.log('Generating social ad for property:', property.id, 'with config:', config);
      
      // Check if OpenAI is available
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      
      // Generate ad copy and hashtags first
      console.log('Generating ad content...');
      const adContent = await this.generateAdContent(property, config);
      console.log('Ad content generated:', adContent);
      
      // Generate social media image
      console.log('Generating ad image...');
      const imageUrl = await this.generateAdImage(property, config);
      console.log('Image URL generated:', imageUrl);
      
      return {
        imageUrl,
        caption: adContent.caption,
        hashtags: adContent.hashtags,
        callToAction: adContent.callToAction,
        targetAudience: adContent.targetAudience
      };
      
    } catch (error) {
      console.error('Social ad generation failed:', error);
      
      // Return demo content when API fails
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        return this.generateDemoAd(property, config);
      }
      
      console.error('Error details:', error.stack);
      throw new Error(`Failed to generate social media ad: ${error.message}`);
    }
  }
  
  private generateDemoAd(property: Property, config: SocialAdConfig): GeneratedAd {
    console.log('Generating demo ad due to API limitations');
    
    // Generate realistic marketing copy without API
    const caption = this.generateLocalCaption(property);
    const hashtags = this.generateHashtagSuggestions(property);
    
    return {
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1024&h=1024&fit=crop',
      caption,
      hashtags,
      callToAction: config.platform === 'linkedin' ? 'Learn More' : 'View Property',
      targetAudience: `${property.propertyType} buyers in ${property.city || 'South Africa'}`
    };
  }
  
  private generateLocalCaption(property: Property): string {
    const features = property.features?.slice(0, 3).join(', ') || 'Premium features';
    const location = property.suburb ? `${property.suburb}, ${property.city}` : property.city || property.address;
    
    return `🏡 ${property.propertyType} in ${location}\n\n` +
           `✨ ${property.bedrooms} bed, ${property.bathrooms} bath\n` +
           `💰 R${property.price?.toLocaleString()}\n` +
           `🌟 ${features}\n\n` +
           `Contact Spurgeon Property today!`;
  }
  
  private async generateAdContent(property: Property, config: SocialAdConfig) {
    const prompt = `
Create compelling social media ad content for this South African property:

Property Details:
- Title: ${property.title}
- Type: ${property.propertyType}
- Listing: ${property.listingType}
- Price: R${property.price?.toLocaleString()}
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Address: ${property.address}, ${property.suburb}, ${property.city}
- Features: ${property.features?.join(', ')}
- Description: ${property.description}

Platform: ${config.platform}
Style: ${config.style}

Generate JSON with:
- caption: Engaging 1-2 sentence property description (max 100 words)
- hashtags: 8-12 relevant hashtags for South African real estate
- callToAction: Strong CTA button text
- targetAudience: Target demographic description

Focus on luxury appeal, location benefits, and lifestyle aspects.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a South African real estate marketing expert specializing in luxury property advertisements for social media platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
  
  private async generateAdImage(property: Property, config: SocialAdConfig): Promise<string> {
    const dimensions = this.getImageDimensions(config.size);
    
    const prompt = `
Create a professional real estate social media advertisement with these specifications:

LAYOUT & DESIGN:
- ${dimensions} aspect ratio
- Modern ${config.style} design aesthetic
- Purple and orange color scheme (Spurgeon Property brand colors)
- Clean, premium layout with white/light backgrounds

PROPERTY DETAILS TO DISPLAY:
- Property Type: ${property.propertyType}
- Price: R${property.price?.toLocaleString()}
- Bedrooms: ${property.bedrooms} beds
- Bathrooms: ${property.bathrooms} baths
- Location: ${property.suburb}, ${property.city}
- Key Features: ${property.features?.slice(0, 3).join(', ')}

BRANDING REQUIREMENTS:
- Include "SPURGEON PROPERTY" logo text prominently
- Purple (#8b5cf6) to orange (#f97316) gradient elements
- Professional typography
- Contact information area
- "PREMIUM PROPERTIES" tagline

VISUAL ELEMENTS:
- Modern property exterior/interior representation
- South African architectural style
- Luxury lifestyle imagery
- Clean geometric shapes and borders
- Professional real estate photography style

PLATFORM: ${config.platform} (${config.size} format)

Create a polished, marketing-ready advertisement that would attract premium property buyers in South Africa.
`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    return response.data?.[0]?.url || '';
  }
  
  private getImageDimensions(size: string): string {
    const dimensions: Record<string, string> = {
      'square': '1:1 (1080x1080px)',
      'story': '9:16 (1080x1920px)', 
      'feed': '4:5 (1080x1350px)',
      'banner': '16:9 (1200x675px)'
    };
    
    return dimensions[size] || dimensions.square;
  }
  
  async generateMultipleAds(property: Property, platforms: SocialAdConfig[]): Promise<GeneratedAd[]> {
    const ads = await Promise.all(
      platforms.map(config => this.generatePropertyAd(property, config))
    );
    
    return ads;
  }
  
  generateHashtagSuggestions(property: Property): string[] {
    const baseHashtags = [
      '#SpurgeonProperty',
      '#SouthAfricanRealEstate',
      '#PropertyForSale',
      '#LuxuryHomes',
      '#RealEstate',
      '#PropertyInvestment'
    ];
    
    const locationHashtags = [
      property.city ? `#${property.city.replace(/\s+/g, '')}Properties` : '',
      property.suburb ? `#${property.suburb.replace(/\s+/g, '')}Homes` : '',
      property.city?.toLowerCase().includes('cape') ? '#CapeTownRealEstate' : '#JohannesburgRealEstate'
    ].filter(Boolean);
    
    const typeHashtags = [
      `#${property.propertyType}ForSale`,
      property.listingType === 'rent' ? '#PropertyRental' : '#PropertyForSale',
      '#DreamHome'
    ];
    
    return [...baseHashtags, ...locationHashtags, ...typeHashtags].slice(0, 12);
  }
}

export const socialAdGenerator = new SocialAdGenerator();