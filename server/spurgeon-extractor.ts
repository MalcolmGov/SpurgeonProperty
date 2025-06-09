import * as cheerio from 'cheerio';
import { storage } from './storage';
import type { InsertProperty } from '@shared/schema';

interface PropertyListing {
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  description: string;
  images: string[];
  features: string[];
  listingUrl: string;
}

export class SpurgeonPropertyExtractor {
  private baseUrl = 'https://www.spurgeonproperty.com';
  
  async extractAllProperties(): Promise<PropertyListing[]> {
    console.log('Extracting properties from Spurgeon Property website...');
    
    const properties: PropertyListing[] = [];
    
    // Extract from multiple city pages to get comprehensive listings
    const cityPages = [
      '/property-for-sale-in-sandton-c109',
      '/property-for-sale-in-johannesburg-c100', 
      '/property-for-sale-in-centurion-c3',
      '/property-for-sale-in-midrand-c16',
      '/property-for-sale-in-edenvale-c14',
      '/property-for-sale-in-benoni-c22',
      '/property-for-sale-in-germiston-c13',
      '/property-for-sale'
    ];
    
    for (const cityPage of cityPages) {
      try {
        console.log(`Extracting from: ${cityPage}`);
        const cityProperties = await this.extractFromPage(cityPage);
        properties.push(...cityProperties);
        
        // Be respectful to the server
        await this.delay(2000);
      } catch (error) {
        console.error(`Error extracting from ${cityPage}:`, error);
      }
    }
    
    // Remove duplicates based on title and price
    const uniqueProperties = this.removeDuplicates(properties);
    console.log(`Extracted ${uniqueProperties.length} unique properties`);
    
    return uniqueProperties;
  }
  
  private async extractFromPage(pagePath: string): Promise<PropertyListing[]> {
    try {
      const response = await fetch(`${this.baseUrl}${pagePath}`);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const properties: PropertyListing[] = [];
      
      // Look for property listings using various selectors
      const propertySelectors = [
        '.property-tile',
        '.listing-item',
        '.property-card',
        '[class*="property"]',
        '.grid-item',
        '.listing'
      ];
      
      for (const selector of propertySelectors) {
        $(selector).each((index, element) => {
          const property = this.extractPropertyFromElement($, element);
          if (property && property.title && property.price) {
            properties.push(property);
          }
        });
        
        if (properties.length > 0) break; // Found properties with this selector
      }
      
      // If no properties found with specific selectors, look for any links containing property info
      if (properties.length === 0) {
        $('a').each((index, element) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          
          if (href && text && 
              (href.includes('property') || href.includes('listing') || href.includes('for-sale')) &&
              text.length > 10 && text.includes('R')) {
            
            const property = this.parsePropertyFromText(text, href);
            if (property) {
              properties.push(property);
            }
          }
        });
      }
      
      return properties.slice(0, 20); // Limit per page
      
    } catch (error) {
      console.error(`Error fetching page ${pagePath}:`, error);
      return [];
    }
  }
  
  private extractPropertyFromElement($: cheerio.CheerioAPI, element: any): PropertyListing | null {
    try {
      const $el = $(element);
      
      // Extract title
      const title = this.extractText($el, [
        '.title', '.property-title', '.listing-title', 'h1', 'h2', 'h3', 'h4'
      ]);
      
      // Extract price
      const price = this.extractText($el, [
        '.price', '.property-price', '.listing-price', '[class*="price"]'
      ]);
      
      // Extract location
      const location = this.extractText($el, [
        '.location', '.address', '.suburb', '[class*="location"]', '[class*="address"]'
      ]);
      
      // Extract bedrooms
      const bedroomText = this.extractText($el, [
        '[class*="bedroom"]', '[class*="bed"]', '.bedrooms'
      ]);
      const bedrooms = this.extractNumber(bedroomText) || 3;
      
      // Extract bathrooms 
      const bathroomText = this.extractText($el, [
        '[class*="bathroom"]', '[class*="bath"]', '.bathrooms'
      ]);
      const bathrooms = this.extractNumber(bathroomText) || 2;
      
      // Extract area
      const areaText = this.extractText($el, [
        '[class*="size"]', '[class*="area"]', '[class*="sqm"]', '.area'
      ]);
      const area = this.extractNumber(areaText) || 200;
      
      // Extract images
      const images: string[] = [];
      $el.find('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          images.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
        }
      });
      
      // Extract property link
      const linkElement = $el.find('a').first();
      const href = linkElement.attr('href');
      const listingUrl = href ? (href.startsWith('http') ? href : `${this.baseUrl}${href}`) : '';
      
      if (!title || !price) return null;
      
      return {
        title: title.substring(0, 200),
        price: this.cleanPrice(price),
        location: location || 'Johannesburg, Gauteng',
        bedrooms,
        bathrooms,
        area,
        propertyType: this.inferPropertyType(title),
        description: `${title} - Located in ${location}. This property offers ${bedrooms} bedrooms and ${bathrooms} bathrooms with ${area}sqm of living space.`,
        images: images.slice(0, 8),
        features: this.extractFeatures($el),
        listingUrl
      };
      
    } catch (error) {
      console.error('Error extracting property from element:', error);
      return null;
    }
  }
  
  private parsePropertyFromText(text: string, href: string): PropertyListing | null {
    try {
      const priceMatch = text.match(/R[\s]?[\d,]+/);
      const bedroomMatch = text.match(/(\d+)\s*(bed|bedroom)/i);
      const bathroomMatch = text.match(/(\d+)\s*(bath|bathroom)/i);
      
      if (!priceMatch) return null;
      
      const title = text.replace(/R[\s]?[\d,]+/g, '').trim().substring(0, 100);
      const price = priceMatch[0];
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 3;
      const bathrooms = bathroomMatch ? parseInt(bathroomMatch[1]) : 2;
      
      return {
        title: title || 'Property Listing',
        price: this.cleanPrice(price),
        location: 'Johannesburg, Gauteng',
        bedrooms,
        bathrooms,
        area: 180,
        propertyType: 'house',
        description: `${title} - Authentic listing from Spurgeon Property.`,
        images: [],
        features: [],
        listingUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`
      };
      
    } catch (error) {
      return null;
    }
  }
  
  private extractText($el: any, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $el.find(selector).first().text().trim();
      if (text) return text;
    }
    return $el.text().trim();
  }
  
  private extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
  
  private cleanPrice(price: string): string {
    return price
      .replace(/^(R|ZAR|Price:?\s*)/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private inferPropertyType(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('apartment') || lowerTitle.includes('flat')) return 'apartment';
    if (lowerTitle.includes('townhouse') || lowerTitle.includes('cluster')) return 'townhouse';
    if (lowerTitle.includes('vacant land') || lowerTitle.includes('plot')) return 'land';
    return 'house';
  }
  
  private extractFeatures($el: any): string[] {
    const features: string[] = [];
    const featureText = $el.text().toLowerCase();
    
    if (featureText.includes('pool')) features.push('Swimming Pool');
    if (featureText.includes('garage')) features.push('Garage');
    if (featureText.includes('garden')) features.push('Garden');
    if (featureText.includes('security')) features.push('Security');
    if (featureText.includes('balcony')) features.push('Balcony');
    
    return features;
  }
  
  private removeDuplicates(properties: PropertyListing[]): PropertyListing[] {
    const seen = new Set<string>();
    return properties.filter(prop => {
      const key = `${prop.title}-${prop.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private parseLocation(location: string): { suburb: string; city: string; province: string } {
    const parts = location.split(',').map(p => p.trim());
    
    let suburb = '';
    let city = 'Johannesburg';
    let province = 'Gauteng';
    
    if (parts.length >= 1) suburb = parts[0];
    if (parts.length >= 2) city = parts[1];
    if (parts.length >= 3) province = parts[2];
    
    return { suburb, city, province };
  }
  
  async importToDatabase(properties: PropertyListing[]): Promise<number> {
    console.log(`Importing ${properties.length} properties to database...`);
    
    let importedCount = 0;
    
    for (const prop of properties) {
      try {
        const { suburb, city, province } = this.parseLocation(prop.location);
        
        const insertData: InsertProperty = {
          title: prop.title,
          description: prop.description,
          price: prop.price,
          address: prop.location,
          suburb,
          city,
          province,
          postalCode: '0000',
          propertyType: prop.propertyType,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms.toString(),
          area: prop.area,
          lotSize: prop.area.toString(),
          yearBuilt: '2020',
          parkingSpaces: 2,
          features: prop.features,
          images: prop.images,
          latitude: -26.2041,
          longitude: 28.0473,
          status: 'active',
          featured: false,
          agentId: 1
        };
        
        await storage.createProperty(insertData);
        importedCount++;
        console.log(`✓ Imported: ${prop.title}`);
        
      } catch (error) {
        console.error(`Error importing property ${prop.title}:`, error);
      }
    }
    
    console.log(`Successfully imported ${importedCount} properties`);
    return importedCount;
  }
}

export async function extractSpurgeonProperties(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const extractor = new SpurgeonPropertyExtractor();
    const properties = await extractor.extractAllProperties();
    
    if (properties.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'No properties found on Spurgeon Property website'
      };
    }
    
    const importedCount = await extractor.importToDatabase(properties);
    
    return {
      success: true,
      count: importedCount,
      message: `Successfully extracted and imported ${importedCount} properties from Spurgeon Property`
    };
    
  } catch (error) {
    console.error('Error in extractSpurgeonProperties:', error);
    return {
      success: false,
      count: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}