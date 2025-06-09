import * as cheerio from 'cheerio';
import { storage } from './storage';
import type { InsertProperty } from '@shared/schema';

interface ScrapedProperty {
  title: string;
  description: string;
  price: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
  latitude?: number;
  longitude?: number;
}

class PropertyScraper {
  private baseUrl = 'https://www.spurgeonproperty.com';
  
  async scrapeAllProperties(): Promise<ScrapedProperty[]> {
    console.log('Starting property scraping from Spurgeon Property...');
    
    try {
      // Get property listing URLs
      const listingUrls = await this.getPropertyListingUrls();
      console.log(`Found ${listingUrls.length} property listings`);
      
      const properties: ScrapedProperty[] = [];
      
      for (const url of listingUrls.slice(0, 20)) { // Limit to first 20 for initial testing
        try {
          const property = await this.scrapePropertyDetails(url);
          if (property) {
            properties.push(property);
            console.log(`Scraped: ${property.title}`);
          }
          // Add delay to be respectful to the server
          await this.delay(1000);
        } catch (error) {
          console.error(`Error scraping property ${url}:`, error);
        }
      }
      
      return properties;
    } catch (error) {
      console.error('Error in scrapeAllProperties:', error);
      return [];
    }
  }
  
  private async getPropertyListingUrls(): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      // Try different property listing pages
      const listingPages = [
        '/property-for-sale',
        '/property-for-sale-in-sandton-c109',
        '/property-for-sale-in-johannesburg-c100',
        '/property-for-sale-in-centurion-c3',
        '/property-for-sale-in-midrand-c16'
      ];
      
      for (const page of listingPages) {
        const pageUrls = await this.scrapePropertyUrlsFromPage(page);
        urls.push(...pageUrls);
      }
      
      return [...new Set(urls)]; // Remove duplicates
    } catch (error) {
      console.error('Error getting property listing URLs:', error);
      return [];
    }
  }
  
  private async scrapePropertyUrlsFromPage(page: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}${page}`);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const urls: string[] = [];
      
      // Look for property links with various selectors
      const selectors = [
        'a[href*="/property-for-sale/"]',
        'a[href*="/for-sale/"]',
        '.property-tile a',
        '.listing-item a',
        '.property-card a'
      ];
      
      selectors.forEach(selector => {
        $(selector).each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('property') && !urls.includes(href)) {
            const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            urls.push(fullUrl);
          }
        });
      });
      
      return urls;
    } catch (error) {
      console.error(`Error scraping URLs from ${page}:`, error);
      return [];
    }
  }
  
  private async scrapePropertyDetails(url: string): Promise<ScrapedProperty | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract property details using multiple selectors
      const title = this.extractText($, [
        'h1.property-title',
        '.listing-title',
        'h1',
        '.property-heading',
        '.title'
      ]);
      
      const price = this.extractText($, [
        '.price',
        '.property-price',
        '.listing-price',
        '[class*="price"]'
      ]);
      
      const description = this.extractText($, [
        '.property-description',
        '.description',
        '.property-details',
        '[class*="description"]'
      ]);
      
      // Extract location details
      const address = this.extractText($, [
        '.property-address',
        '.address',
        '.location',
        '[class*="address"]'
      ]);
      
      // Extract property specifications
      const bedroomsText = this.extractText($, [
        '[class*="bedroom"]',
        '[class*="bed"]',
        '.bedrooms'
      ]);
      const bedrooms = this.extractNumber(bedroomsText);
      
      const bathroomsText = this.extractText($, [
        '[class*="bathroom"]',
        '[class*="bath"]',
        '.bathrooms'
      ]);
      const bathrooms = this.extractNumber(bathroomsText);
      
      const areaText = this.extractText($, [
        '[class*="size"]',
        '[class*="area"]',
        '.property-size'
      ]);
      const area = this.extractNumber(areaText);
      
      // Extract images
      const images: string[] = [];
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src && (src.includes('property') || src.includes('image'))) {
          const fullSrc = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
          images.push(fullSrc);
        }
      });
      
      // Extract features
      const features: string[] = [];
      $('[class*="feature"], [class*="amenity"], li').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 2 && text.length < 50) {
          features.push(text);
        }
      });
      
      if (!title || !price) {
        return null;
      }
      
      // Parse location from address
      const { suburb, city, province } = this.parseLocation(address);
      
      return {
        title: title.substring(0, 200),
        description: description.substring(0, 1000) || 'Property description not available',
        price: this.cleanPrice(price),
        address: address || 'Address not specified',
        suburb: suburb || 'Unknown',
        city: city || 'Johannesburg',
        province: province || 'Gauteng',
        propertyType: this.inferPropertyType(title + ' ' + description),
        bedrooms: bedrooms || 3,
        bathrooms: bathrooms || 2,
        area: area || 150,
        images: images.slice(0, 10),
        features: features.slice(0, 20)
      };
      
    } catch (error) {
      console.error(`Error scraping property details from ${url}:`, error);
      return null;
    }
  }
  
  private extractText($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }
  
  private extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
  
  private cleanPrice(price: string): string {
    // Remove common prefixes and clean up the price
    return price
      .replace(/^(R|ZAR|Price:?\s*)/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private parseLocation(address: string): { suburb: string; city: string; province: string } {
    const parts = address.split(',').map(p => p.trim());
    
    const knownCities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'sandton', 'centurion', 'midrand'];
    const knownProvinces = ['gauteng', 'western cape', 'kwazulu-natal', 'eastern cape', 'free state', 'limpopo', 'mpumalanga', 'north west', 'northern cape'];
    
    let suburb = '';
    let city = 'Johannesburg';
    let province = 'Gauteng';
    
    for (const part of parts) {
      const lowerPart = part.toLowerCase();
      if (knownCities.some(c => lowerPart.includes(c))) {
        city = part;
      } else if (knownProvinces.some(p => lowerPart.includes(p))) {
        province = part;
      } else if (!suburb && part.length > 0) {
        suburb = part;
      }
    }
    
    return { suburb: suburb || 'Unknown', city, province };
  }
  
  private inferPropertyType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('apartment') || lowerText.includes('flat')) return 'apartment';
    if (lowerText.includes('townhouse') || lowerText.includes('cluster')) return 'townhouse';
    if (lowerText.includes('house') || lowerText.includes('home')) return 'house';
    if (lowerText.includes('vacant land') || lowerText.includes('plot')) return 'land';
    if (lowerText.includes('commercial') || lowerText.includes('office')) return 'commercial';
    if (lowerText.includes('industrial')) return 'industrial';
    
    return 'house'; // Default
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async importToDatabase(properties: ScrapedProperty[]): Promise<void> {
    console.log(`Importing ${properties.length} properties to database...`);
    
    for (const prop of properties) {
      try {
        const insertData: InsertProperty = {
          title: prop.title,
          description: prop.description,
          price: prop.price,
          address: prop.address,
          suburb: prop.suburb,
          city: prop.city,
          province: prop.province,
          postalCode: '0000',
          propertyType: prop.propertyType,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms.toString(),
          area: prop.area,
          lotSize: prop.area,
          yearBuilt: 2020,
          parkingSpaces: 2,
          features: prop.features,
          images: prop.images,
          latitude: prop.latitude || -26.2041,
          longitude: prop.longitude || 28.0473,
          status: 'active',
          featured: false,
          agentId: 1 // Assign to first agent
        };
        
        await storage.createProperty(insertData);
        console.log(`✓ Imported: ${prop.title}`);
        
      } catch (error) {
        console.error(`Error importing property ${prop.title}:`, error);
      }
    }
    
    console.log('Property import completed!');
  }
}

export const propertyScraper = new PropertyScraper();

// Export function for route handler
export async function scrapeAndImportProperties(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const properties = await propertyScraper.scrapeAllProperties();
    
    if (properties.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'No properties found to scrape'
      };
    }
    
    await propertyScraper.importToDatabase(properties);
    
    return {
      success: true,
      count: properties.length,
      message: `Successfully scraped and imported ${properties.length} properties`
    };
    
  } catch (error) {
    console.error('Error in scrapeAndImportProperties:', error);
    return {
      success: false,
      count: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}