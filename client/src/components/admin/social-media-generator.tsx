import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Image, Loader2, Share2, CheckSquare, Home, MapPin, DollarSign, Camera, Instagram, Facebook, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  propertyType: string;
  listingType: string;
  address: string;
  suburb: string;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  featuredImage?: string;
  features?: string[];
  status: string;
}

interface SocialFormat {
  name: string;
  width: number;
  height: number;
  description: string;
  platforms: string[];
}

const SOCIAL_FORMATS: SocialFormat[] = [
  { name: 'Square Post', width: 1080, height: 1080, description: 'Perfect for Instagram posts & Facebook', platforms: ['Instagram', 'Facebook'] },
  { name: 'Instagram Story', width: 1080, height: 1920, description: 'Vertical format for stories', platforms: ['Instagram', 'TikTok'] },
  { name: 'Facebook Cover', width: 1200, height: 630, description: 'Landscape format for covers', platforms: ['Facebook', 'LinkedIn'] },
  { name: 'TikTok Video', width: 1080, height: 1920, description: 'Vertical video format', platforms: ['TikTok', 'YouTube Shorts'] },
];

export function SocialMediaGenerator() {
  const { toast } = useToast();
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(SOCIAL_FORMATS[0]);
  const [generating, setGenerating] = useState(false);
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch all properties for selection (both featured and non-featured)
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties', 'social-media-all'],
    queryFn: () => 
      fetch('/api/properties?limit=100&status=all', {
        credentials: 'include'
      }).then(res => res.json()) as Promise<Property[]>
  });

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "POA";
    
    // Convert to millions format like "R2,95m"
    if (price >= 1000000) {
      const millions = price / 1000000;
      // Format with comma as decimal separator for South African style
      return `R${millions.toFixed(2).replace('.', ',')}m`;
    } else if (price >= 1000) {
      const thousands = price / 1000;
      return `R${thousands.toFixed(0)}k`;
    } else {
      return `R${price.toLocaleString()}`;
    }
  };

  const getImageSrc = (property: Property) => {
    const imageToUse = property.featuredImage || property.images?.[0];
    if (!imageToUse) return '/api/placeholder/400/300';
    
    if (imageToUse.startsWith('http') || imageToUse.startsWith('/uploads')) {
      return imageToUse;
    }
    return `/uploads/${imageToUse}`;
  };

  const togglePropertySelection = (propertyId: number) => {
    setSelectedProperties(prev => {
      const isSelected = prev.includes(propertyId);
      if (isSelected) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const selectAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      // If all are selected, deselect all
      setSelectedProperties([]);
    } else {
      // Select all properties
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const generateSocialImages = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select one or more properties to generate social media images",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Generate images for all selected properties
      for (let i = 0; i < selectedProperties.length; i++) {
        const propertyId = selectedProperties[i];
        const property = properties.find(p => p.id === propertyId);
        if (!property) continue;

      // Create a temporary canvas element for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${selectedFormat.width}px`;
      tempDiv.style.height = `${selectedFormat.height}px`;
      tempDiv.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #f97316 100%)';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.color = 'white';
      tempDiv.style.overflow = 'hidden';
      
      // Create format-specific layouts
      const isVertical = selectedFormat.height > selectedFormat.width;
      const isSquare = selectedFormat.width === selectedFormat.height;
      
      tempDiv.innerHTML = isVertical ? `
        <!-- Vertical Layout for Stories/TikTok -->
        <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff;">
          
          <!-- Property Image Top (65% height) -->
          <div style="flex: 1.8; position: relative; overflow: hidden;">
            <img src="${getImageSrc(property)}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 crossorigin="anonymous" />
            
            <!-- Header with Logo -->
            <div style="position: absolute; top: 40px; left: 30px; right: 30px; display: flex; justify-content: space-between; align-items: center;">
              <div style="background: rgba(255,255,255,0.98); padding: 15px 20px; border-radius: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                <img src="/spurgeon-logo.png" style="height: 35px;" crossorigin="anonymous" />
              </div>
              <div style="background: rgba(139, 92, 246, 0.95); color: white; padding: 12px 20px; border-radius: 25px; font-weight: 700; 
                          font-size: 14px; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(10px);
                          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);">
                🏢 ${property.propertyType.toUpperCase()}
              </div>
            </div>
            
            <!-- Features Overlay -->
            ${property.bedrooms && property.bathrooms ? `
              <div style="position: absolute; bottom: 30px; left: 30px; right: 30px;">
                <div style="background: rgba(0,0,0,0.85); color: white; padding: 18px 25px; 
                           border-radius: 20px; display: flex; justify-content: center; gap: 30px; backdrop-filter: blur(15px);
                           box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 22px;">🛏️</span>
                    <span style="font-weight: bold; font-size: 18px;">${property.bedrooms}</span>
                    <span style="font-size: 16px;">Beds</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 22px;">🚿</span>
                    <span style="font-weight: bold; font-size: 18px;">${property.bathrooms}</span>
                    <span style="font-size: 16px;">Baths</span>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Content Bottom (35% height) -->
          <div style="flex: 1; background: linear-gradient(135deg, #8b5cf6 0%, #f97316 100%); 
                      color: white; padding: 40px 35px; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            
            <!-- Property Details -->
            <div>
              <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px; line-height: 1.2; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                ${property.title}
              </h1>
              
              <div style="font-size: 18px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0.95;">
                <span style="font-size: 22px;">📍</span>
                <span style="font-weight: 500;">${property.suburb}, ${property.city}</span>
              </div>
              
              <!-- Price Box -->
              <div style="background: white; color: #8b5cf6; padding: 20px 25px; border-radius: 20px; margin: 20px auto; 
                         display: inline-block; box-shadow: 0 12px 40px rgba(0,0,0,0.15); min-width: 180px;">
                <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px; font-weight: 600; letter-spacing: 1px;">PRICE</div>
                <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px;">${formatPrice(property.price)}</div>
              </div>
              
              ${property.features && property.features.length > 0 ? `
                <div style="margin: 25px 0;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 12px; font-weight: 600; letter-spacing: 1px;">FEATURES</div>
                  <div style="font-size: 16px; line-height: 1.5; font-weight: 500;">
                    ${property.features.slice(0, 2).map(feature => `• ${feature}`).join('<br>')}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <!-- Footer Contact -->
            <div style="border-top: 2px solid rgba(255,255,255,0.2); padding-top: 20px;">
              <div style="margin-bottom: 12px;">
                <a href="tel:+27842089307" style="color: white; text-decoration: none; font-size: 18px; font-weight: 700;">📞 084 208 9307</a>
              </div>
              <div style="margin-bottom: 12px;">
                <a href="https://www.spurgeonproperty.co.za/properties/${property.id}" 
                   style="color: white; text-decoration: none; font-size: 14px; font-weight: 600;
                          background: rgba(255,255,255,0.25); padding: 10px 18px; border-radius: 20px; display: inline-block;
                          backdrop-filter: blur(10px);">
                  👀 View Property Details
                </a>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <!-- Horizontal/Square Layout - Top/Bottom Split -->
        <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff;">
          
          <!-- Content Top (45% height) - Gradient Background Layout -->
          <div style="flex: 0.9; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #ec4899 50%, #f97316 100%); 
                      color: white; padding: 40px; display: flex; flex-direction: column; justify-content: space-between;
                      position: relative; overflow: hidden;">
            
            <!-- Header Row - Logo and Property Type -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding: 0 20px;">
              <!-- Spurgeon Property Logo -->
              <div style="background: #ffffff !important; padding: 14px 24px; border-radius: 28px; 
                         box-shadow: 0 8px 30px rgba(0,0,0,0.25); border: 2px solid #ffffff;
                         position: relative; overflow: hidden;">
                <div style="background: #ffffff; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 26px;"></div>
                <img src="/spurgeon-logo.png" 
                     style="height: 42px; width: auto; display: block; filter: sepia(1) hue-rotate(235deg) brightness(1.2) contrast(1.1); 
                            position: relative; z-index: 2; background: #ffffff; border-radius: 3px; padding: 3px;" 
                     alt="Spurgeon Property" />
              </div>
              <!-- Property Type Badge -->
              <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; 
                          padding: 12px 20px; border-radius: 25px; font-weight: 800; 
                          font-size: 12px; backdrop-filter: blur(15px); border: 2px solid rgba(255,255,255,0.6);
                          letter-spacing: 0.8px; box-shadow: 0 6px 20px rgba(139,92,246,0.3);
                          text-shadow: 1px 1px 2px rgba(0,0,0,0.3); min-width: fit-content; white-space: nowrap;">
                🏢 ${property.propertyType.toUpperCase()}
              </div>
            </div>
            
            <!-- Main Title - Improved Hierarchy -->
            <div style="text-align: center; margin-bottom: 35px; padding: 0 30px;">
              <h1 style="font-size: ${isSquare ? '38px' : '34px'}; font-weight: 900; 
                         line-height: 1.15; color: white; letter-spacing: -0.5px; margin: 0;
                         text-shadow: 4px 4px 16px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,0.7), 
                                      0 0 20px rgba(0,0,0,0.5); 
                         text-align: center; word-wrap: break-word;">
                ${property.title}
              </h1>
            </div>
            
            <!-- Location with Enhanced Pin -->
            <div style="text-align: center; margin-bottom: 35px; padding: 0 25px;">
              <div style="font-size: 22px; color: white; font-weight: 700; 
                         text-shadow: 3px 3px 12px rgba(0,0,0,0.9), 1px 1px 6px rgba(0,0,0,0.8);
                         display: flex; align-items: center; justify-content: center; gap: 12px;">
                <span style="font-size: 24px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));">📍</span>
                <span>${property.suburb}, ${property.city}</span>
              </div>
            </div>
            
            <!-- Property Specs - Clean Badge Style -->
            ${property.bedrooms && property.bathrooms ? `
              <div style="text-align: center; margin-bottom: 40px; padding: 0 20px;">
                <div style="display: inline-flex; align-items: center; gap: 25px; 
                           background: rgba(0,0,0,0.4); padding: 16px 28px; border-radius: 50px;
                           backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
                  <div style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 800; font-size: 16px;">
                    <span style="font-size: 20px;">🛏️</span>
                    <span>${property.bedrooms} Beds</span>
                  </div>
                  <div style="width: 2px; height: 20px; background: rgba(255,255,255,0.4);"></div>
                  <div style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 800; font-size: 16px;">
                    <span style="font-size: 20px;">🛁</span>
                    <span>${property.bathrooms} Baths</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Price - Large and Bold -->
            <div style="text-align: center; margin-bottom: 35px; padding: 0 20px;">
              <div style="font-size: ${isSquare ? '64px' : '58px'}; font-weight: 900; 
                         color: white; letter-spacing: -2px; line-height: 0.9;
                         text-shadow: 5px 5px 20px rgba(0,0,0,0.9), 3px 3px 12px rgba(0,0,0,0.8),
                                      0 0 30px rgba(0,0,0,0.6);
                         word-break: keep-all; white-space: nowrap;">
                ${formatPrice(property.price)}
              </div>
            </div>
            
            <!-- Contact Information - Enhanced with Better Spacing -->
            <div style="text-align: center; margin-bottom: 25px; padding: 0 15px;">
              <div style="color: #FFFFFF; font-weight: 900; 
                         text-shadow: 3px 3px 12px rgba(0,0,0,0.9), 1px 1px 6px rgba(0,0,0,0.8);">
                <div style="font-size: 24px; margin-bottom: 12px; letter-spacing: 0.5px;
                           display: flex; align-items: center; justify-content: center; gap: 10px;">
                  <span style="font-size: 26px;">📞</span>
                  <span>084 208 9307</span>
                </div>
                <div style="font-size: 16px; margin-bottom: 8px; letter-spacing: 0.3px;
                           display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="font-size: 18px;">✉️</span>
                  <span>peter@spurgeonproperty.com</span>
                </div>
                <div style="font-size: 16px; letter-spacing: 0.3px;
                           display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="font-size: 18px;">🌐</span>
                  <span>spurgeonproperty.com</span>
                </div>
              </div>
            </div>
            
            <!-- Footer Attribution -->
            <div style="text-align: center; margin-top: auto; padding: 0 15px;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600;
                         text-shadow: 1px 1px 4px rgba(0,0,0,0.8); letter-spacing: 0.5px;">
                Prepared by Spurgeon Property
              </div>
            </div>
            
          </div>
          
          <!-- Property Image Bottom (55% height) -->
          <div style="flex: 1.1; position: relative; overflow: hidden;">
            <img src="${getImageSrc(property)}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 crossorigin="anonymous" />
            

          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Wait for images to load
      const images = tempDiv.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); // Continue even if image fails
          }
        });
      }));

      // Generate the image
      const canvas = await html2canvas(tempDiv, {
        width: selectedFormat.width,
        height: selectedFormat.height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      // Clean up
      document.body.removeChild(tempDiv);

        // Download the image
        const link = document.createElement('a');
        link.download = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_social_media_${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Small delay between downloads to avoid browser blocking
        if (i < selectedProperties.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Success!",
        description: `${selectedProperties.length} social media image${selectedProperties.length > 1 ? 's' : ''} generated and downloaded`,
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate social media images",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateCustomBeachfrontPoster = async () => {
    if (generatingCustom) return;
    
    try {
      setGeneratingCustom(true);
      
      // Create custom property data for Table View beachfront apartment
      const customProperty = {
        title: "Stunning, Fully Furnished Beachfront 2 Bedroom Apartment for Sale",
        suburb: "Table View",
        city: "Blouberg", 
        bedrooms: 2,
        bathrooms: 1,
        price: "R2,950,000",
        propertyType: "APARTMENT"
      };

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${selectedFormat.width}px`;
      tempDiv.style.height = `${selectedFormat.height}px`;

      tempDiv.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative; 
                    background: linear-gradient(135deg, #8B5CF6 0%, #F97316 100%);
                    font-family: Arial, sans-serif; display: flex; flex-direction: column;
                    border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25);">
          
          <!-- Property Type Badge -->
          <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
            <div style="background: rgba(0,0,0,0.4); color: white; padding: 8px 16px; 
                       border-radius: 50px; font-size: 12px; font-weight: 700;
                       backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);
                       text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">
              🏠 ${customProperty.propertyType}
            </div>
          </div>
          
          <!-- Content Section (45% height) -->
          <div style="flex: 0.85; display: flex; flex-direction: column; justify-content: space-between; 
                     padding: 35px 25px 25px 25px; position: relative; z-index: 2;">
            
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="width: 42px; height: 42px; margin: 0 auto; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                           background: white; border-radius: 8px; z-index: 1;"></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                           background: white !important; border-radius: 8px; z-index: 2;"></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                           background: white !important; border-radius: 8px; z-index: 3;"></div>
                <img src="/spurgeon-logo.png" 
                     style="position: relative; z-index: 4; width: 100%; height: 100%; 
                           object-fit: contain; border-radius: 8px;" />
              </div>
            </div>
            
            <!-- Property Title -->
            <div style="text-align: center; margin-bottom: 30px; padding: 0 15px;">
              <div style="font-size: 28px; font-weight: 900; color: white; line-height: 1.2;
                         text-shadow: 4px 4px 16px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,0.8);
                         letter-spacing: -0.5px;">
                ${customProperty.title}
              </div>
            </div>
            
            <!-- Location with Enhanced Pin -->
            <div style="text-align: center; margin-bottom: 35px; padding: 0 25px;">
              <div style="font-size: 22px; color: white; font-weight: 700; 
                         text-shadow: 3px 3px 12px rgba(0,0,0,0.9), 1px 1px 6px rgba(0,0,0,0.8);
                         display: flex; align-items: center; justify-content: center; gap: 12px;">
                <span style="font-size: 24px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));">📍</span>
                <span>${customProperty.suburb}, ${customProperty.city}</span>
              </div>
            </div>
            
            <!-- Property Specs - Clean Badge Style -->
            <div style="text-align: center; margin-bottom: 40px; padding: 0 20px;">
              <div style="display: inline-flex; align-items: center; gap: 25px; 
                         background: rgba(255,255,255,0.15); padding: 16px 28px; border-radius: 50px;
                         backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
                <div style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 800; font-size: 16px;">
                  <span style="font-size: 20px;">🛏️</span>
                  <span>${customProperty.bedrooms} Beds</span>
                </div>
                <div style="width: 2px; height: 20px; background: rgba(255,255,255,0.4);"></div>
                <div style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 800; font-size: 16px;">
                  <span style="font-size: 20px;">🛁</span>
                  <span>${customProperty.bathrooms} Bath</span>
                </div>
              </div>
            </div>
            
            <!-- Price - Large and Bold -->
            <div style="text-align: center; margin-bottom: 35px; padding: 0 20px;">
              <div style="font-size: 64px; font-weight: 900; 
                         color: white; letter-spacing: -2px; line-height: 0.9;
                         text-shadow: 5px 5px 20px rgba(0,0,0,0.9), 3px 3px 12px rgba(0,0,0,0.8),
                                      0 0 30px rgba(0,0,0,0.6);
                         word-break: keep-all; white-space: nowrap;">
                ${customProperty.price}
              </div>
            </div>
            
            <!-- Contact Information - Enhanced with Better Spacing -->
            <div style="text-align: center; margin-bottom: 25px; padding: 0 15px;">
              <div style="color: #FFFFFF; font-weight: 900; 
                         text-shadow: 3px 3px 12px rgba(0,0,0,0.9), 1px 1px 6px rgba(0,0,0,0.8);">
                <div style="font-size: 24px; margin-bottom: 12px; letter-spacing: 0.5px;
                           display: flex; align-items: center; justify-content: center; gap: 10px;">
                  <span style="font-size: 26px;">📞</span>
                  <span>084 208 9307</span>
                </div>
                <div style="font-size: 16px; margin-bottom: 8px; letter-spacing: 0.3px;
                           display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="font-size: 18px;">✉️</span>
                  <span>peter@spurgeonproperty.com</span>
                </div>
                <div style="font-size: 16px; letter-spacing: 0.3px;
                           display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="font-size: 18px;">🌐</span>
                  <span>spurgeonproperty.com</span>
                </div>
              </div>
            </div>
            
            <!-- Footer Attribution -->
            <div style="text-align: center; margin-top: auto; padding: 0 15px;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600;
                         text-shadow: 1px 1px 4px rgba(0,0,0,0.8); letter-spacing: 0.5px;">
                Prepared by Spurgeon Property
              </div>
            </div>
            
          </div>
          
          <!-- Property Image Bottom (55% height) with Ocean View Placeholder -->
          <div style="flex: 1.1; position: relative; overflow: hidden; border-radius: 0 0 24px 24px;">
            <div style="width: 100%; height: 100%; 
                       background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #22D3EE 100%);
                       display: flex; align-items: center; justify-content: center; position: relative;">
              <!-- Ocean waves effect -->
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
                         background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                                     linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                                     linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                                     linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
                         background-size: 20px 20px;
                         background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                         opacity: 0.3;"></div>
              <!-- Beachfront apartment representation -->
              <div style="position: relative; z-index: 2; text-align: center; color: white;">
                <div style="font-size: 48px; margin-bottom: 10px; text-shadow: 2px 2px 8px rgba(0,0,0,0.7);">🏖️</div>
                <div style="font-size: 18px; font-weight: 700; text-shadow: 2px 2px 8px rgba(0,0,0,0.7);">Beachfront Ocean View</div>
                <div style="font-size: 14px; opacity: 0.9; text-shadow: 1px 1px 4px rgba(0,0,0,0.7);">Table View, Blouberg</div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Wait for any images to load
      const images = tempDiv.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          }
        });
      }));

      // Generate the image
      const canvas = await html2canvas(tempDiv, {
        width: selectedFormat.width,
        height: selectedFormat.height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      // Clean up
      document.body.removeChild(tempDiv);

      // Download the image
      const link = document.createElement('a');
      link.download = `Table_View_Beachfront_Apartment_Social_Media_Poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Success!",
        description: "Custom beachfront apartment poster generated and downloaded",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate custom poster",
        variant: "destructive",
      });
    } finally {
      setGeneratingCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          Social Media Image Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Generate eye-catching square property images optimized for Instagram posts and Facebook marketing.
        </p>
      </div>



      {/* Property Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Select Properties
              </CardTitle>
              <CardDescription>
                Choose properties to generate social media images ({selectedProperties.length} selected)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllProperties}
              className="min-w-[100px]"
            >
              {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {properties.map((property) => (
              <div
                key={property.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedProperties.includes(property.id)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePropertySelection(property.id)}
              >
                <div className="relative h-32 bg-gray-100">
                  <img
                    src={getImageSrc(property)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      className="bg-white shadow-sm pointer-events-none"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
                      {property.propertyType}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {property.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.suburb}, {property.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium text-purple-600">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={generateSocialImages}
            disabled={generating || selectedProperties.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating {selectedProperties.length} Image{selectedProperties.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Generate & Download {selectedProperties.length} Image{selectedProperties.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
          
          {selectedProperties.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-2">
              Select properties above to generate social media images
            </p>
          )}
          
          {selectedProperties.length > 0 && (
            <p className="text-center text-gray-600 text-sm mt-2">
              {selectedProperties.length} propert{selectedProperties.length > 1 ? 'ies' : 'y'} selected • Each will download automatically
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Poster Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Custom Poster Generator
          </CardTitle>
          <CardDescription>
            Generate a specific beachfront apartment poster with custom design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Table View Beachfront Apartment</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span className="font-medium">Location:</span> Table View, Blouberg
              </div>
              <div>
                <span className="font-medium">Price:</span> R2,950,000
              </div>
              <div>
                <span className="font-medium">Type:</span> 2 Bed, 1 Bath Apartment
              </div>
              <div>
                <span className="font-medium">Style:</span> Beachfront Ocean View
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generateCustomBeachfrontPoster}
            disabled={generatingCustom}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3"
            size="lg"
          >
            {generatingCustom ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Custom Poster...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Generate Table View Beachfront Poster
              </>
            )}
          </Button>
          
          <p className="text-center text-gray-600 text-sm mt-2">
            Custom poster with purple-orange gradient, ocean theme, and professional branding
          </p>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram & Facebook
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use Square Post (1080×1080) for feed posts</li>
                <li>• Use Instagram Story (1080×1920) for stories</li>
                <li>• Add engaging captions with property highlights</li>
                <li>• Include relevant hashtags (#property #realestate)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                TikTok & YouTube Shorts
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Use TikTok Video (1080×1920) format</li>
                <li>• Perfect for vertical video content</li>
                <li>• Great for property tours and highlights</li>
                <li>• Optimized for mobile viewing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}