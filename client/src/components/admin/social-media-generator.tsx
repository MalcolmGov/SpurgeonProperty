import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Image, Loader2, Share2, CheckSquare, Home, MapPin, DollarSign, Camera, Instagram, Facebook } from 'lucide-react';
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
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch all properties for selection
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => 
      fetch('/api/properties?limit=100', {
        credentials: 'include'
      }).then(res => res.json()) as Promise<Property[]>
  });

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "POA";
    return `R ${price.toLocaleString()}`;
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
        // For social media, limit to 1 property per image for best results
        return [propertyId];
      }
    });
  };

  const generateSocialImage = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Property Selected",
        description: "Please select a property to generate social media image",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      const property = properties.find(p => p.id === selectedProperties[0]);
      if (!property) throw new Error('Property not found');

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
      
      // Create the social media post content
      tempDiv.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;">
          <!-- Background Image -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;">
            <img src="${getImageSrc(property)}" 
                 style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;" 
                 crossorigin="anonymous" />
          </div>
          
          <!-- Gradient Overlay -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                      background: linear-gradient(45deg, rgba(139, 92, 246, 0.8) 0%, rgba(249, 115, 22, 0.8) 100%);"></div>
          
          <!-- Content -->
          <div style="position: relative; z-index: 10; padding: 60px; display: flex; flex-direction: column; height: 100%;">
            
            <!-- Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px;">
              <div style="background: white; color: #8b5cf6; padding: 15px 25px; border-radius: 25px; font-weight: bold; font-size: 18px;">
                SPURGEON PROPERTY
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 20px; font-size: 16px;">
                ${property.propertyType.toUpperCase()}
              </div>
            </div>
            
            <!-- Main Content -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="font-size: ${selectedFormat.width > 1200 ? '48px' : '36px'}; font-weight: bold; 
                         margin-bottom: 20px; line-height: 1.2; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                ${property.title}
              </h1>
              
              <div style="font-size: 24px; margin-bottom: 30px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">📍</span>
                ${property.suburb}, ${property.city}
              </div>
              
              ${property.bedrooms && property.bathrooms ? `
                <div style="display: flex; gap: 30px; margin-bottom: 30px; font-size: 20px;">
                  <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🛏️</span>
                    ${property.bedrooms} Beds
                  </div>
                  <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🚿</span>
                    ${property.bathrooms} Baths
                  </div>
                </div>
              ` : ''}
              
              <div style="font-size: ${selectedFormat.width > 1200 ? '56px' : '42px'}; font-weight: bold; 
                         background: white; color: #8b5cf6; padding: 20px 30px; border-radius: 15px; 
                         display: inline-block; text-align: center; margin-bottom: 30px;">
                ${formatPrice(property.price)}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 18px;">
                📞 0842089307 | 📧 peter@spurgeonproperty.com
              </div>
              <div style="font-size: 16px; background: rgba(255,255,255,0.2); 
                         padding: 10px 20px; border-radius: 20px;">
                www.spurgeonproperty.co.za
              </div>
            </div>
            
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
      link.download = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedFormat.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Success!",
        description: `Social media image generated and downloaded: ${selectedFormat.name}`,
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate social media image",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          Social Media Image Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Generate eye-catching property images optimized for Facebook, Instagram, TikTok, and other social platforms.
        </p>
      </div>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Social Media Format
          </CardTitle>
          <CardDescription>
            Choose the format that best fits your target platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOCIAL_FORMATS.map((format) => (
              <div
                key={format.name}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedFormat.name === format.name
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFormat(format)}
              >
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                  <div 
                    className="bg-white rounded shadow-sm"
                    style={{
                      width: format.width > format.height ? '60px' : '40px',
                      height: format.width > format.height ? '40px' : '60px',
                    }}
                  />
                </div>
                <h3 className="font-medium text-sm mb-1">{format.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{format.width}×{format.height}</p>
                <p className="text-xs text-gray-600">{format.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {format.platforms.map(platform => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Select Property
          </CardTitle>
          <CardDescription>
            Choose one property to feature in your social media image
          </CardDescription>
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
            onClick={generateSocialImage}
            disabled={generating || selectedProperties.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Generate & Download {selectedFormat.name}
              </>
            )}
          </Button>
          
          {selectedProperties.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-2">
              Select a property above to generate social media image
            </p>
          )}
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