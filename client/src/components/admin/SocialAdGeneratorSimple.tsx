import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Download, Copy, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: number;
  title: string;
  propertyType: string;
  listingType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  suburb: string;
  city: string;
  features: string[];
  description: string;
  images: string[];
}

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

export default function SocialAdGeneratorSimple() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [adConfig, setAdConfig] = useState<SocialAdConfig>({
    platform: 'facebook',
    size: 'square',
    style: 'modern'
  });
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  
  // Fetch properties for selection
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    select: (data: Property[]) => data?.filter(p => p.listingType === 'sale' || p.listingType === 'rent') || []
  });

  // Generate social media ad
  const generateAdMutation = useMutation({
    mutationFn: async (config: SocialAdConfig & { propertyId: number }) => {
      const response = await fetch(`/api/properties/${config.propertyId}/social-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: config.platform,
          size: config.size,
          style: config.style
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate ad');
      }
      
      return response.json();
    },
    onSuccess: (data: GeneratedAd) => {
      setGeneratedAds(prev => [...prev, data]);
      toast({
        title: "Social Ad Generated!",
        description: `Created ${adConfig.platform} ad successfully.`
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "API Quota Exceeded",
        description: "OpenAI API quota exceeded. Please add credits to your OpenAI account to generate AI-powered social media ads.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateAd = () => {
    if (!selectedProperty) {
      toast({
        title: "No Property Selected",
        description: "Please select a property first.",
        variant: "destructive"
      });
      return;
    }
    
    generateAdMutation.mutate({
      ...adConfig,
      propertyId: selectedProperty.id
    });
  };

  const handleCopyCaption = (caption: string, hashtags: string[]) => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    toast({ title: "Copied to clipboard!" });
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Image downloaded!" });
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: "Could not download image.",
        variant: "destructive" 
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Social Media Ad Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Property</label>
              <Select onValueChange={(value) => {
                const property = properties.find(p => p.id === parseInt(value));
                setSelectedProperty(property || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.title} - R{property.price?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={adConfig.platform} onValueChange={(value) => 
                setAdConfig(prev => ({ ...prev, platform: value as any }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Size Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad Size</label>
              <Select value={adConfig.size} onValueChange={(value) => 
                setAdConfig(prev => ({ ...prev, size: value as any }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="feed">Feed (4:5)</SelectItem>
                  <SelectItem value="story">Story (9:16)</SelectItem>
                  <SelectItem value="banner">Banner (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select value={adConfig.style} onValueChange={(value) => 
                setAdConfig(prev => ({ ...prev, style: value as any }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Property Info */}
          {selectedProperty && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                Selected: {selectedProperty.title}
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                {selectedProperty.propertyType} • {selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath • R{selectedProperty.price?.toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 flex gap-4">
            <Button 
              onClick={handleGenerateAd}
              disabled={!selectedProperty || generateAdMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              {generateAdMutation.isPending ? "Generating..." : "Generate Social Ad"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // Generate demo ad with selected property or first property
                const demoProperty = selectedProperty || properties[0];
                if (demoProperty) {
                  const demoAd = {
                    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1024&h=1024&fit=crop',
                    caption: `🏡 ${demoProperty.propertyType} in ${demoProperty.suburb || demoProperty.city}\n\n✨ ${demoProperty.bedrooms} bed, ${demoProperty.bathrooms} bath\n💰 R${demoProperty.price?.toLocaleString()}\n🌟 ${demoProperty.features?.slice(0, 3).join(', ') || 'Premium features'}\n\nContact Spurgeon Property today!`,
                    hashtags: ['#Property', '#RealEstate', '#SouthAfrica', `#${demoProperty.city?.replace(/\s+/g, '')}`, `#${demoProperty.propertyType}ForSale`],
                    callToAction: 'View Property',
                    targetAudience: `${demoProperty.propertyType} buyers in ${demoProperty.city}`
                  };
                  setGeneratedAds([demoAd]);
                  toast({
                    title: "Demo Ad Generated!",
                    description: "This shows how your social media ads will look."
                  });
                }
              }}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              View Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Ads Display */}
      {generatedAds.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Social Media Ads</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generatedAds.map((ad, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(adConfig.platform)}
                      Social Media Ad #{index + 1}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {adConfig.platform}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Generated Image */}
                  <div className="relative group">
                    <img 
                      src={ad.imageUrl} 
                      alt="Generated social ad"
                      className="w-full h-64 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadImage(ad.imageUrl, `social-ad-${index + 1}.png`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Ad Content */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Caption</label>
                      <Textarea 
                        value={ad.caption}
                        readOnly
                        className="mt-1 text-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Hashtags</label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ad.hashtags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-gray-600">Call to Action</label>
                        <p className="text-purple-600 font-medium">{ad.callToAction}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600">Target Audience</label>
                        <p className="text-gray-700">{ad.targetAudience}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCaption(ad.caption, ad.hashtags)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadImage(ad.imageUrl, `social-ad-${index + 1}.png`)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}