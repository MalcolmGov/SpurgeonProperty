import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Download, Image, Loader2, ExternalLink, CheckSquare, Square, Home, MapPin, DollarSign } from 'lucide-react';

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

interface CatalogueResponse {
  success: boolean;
  message: string;
  filename: string;
  downloadUrl: string;
}

export function CatalogueGenerator() {
  const { toast } = useToast();
  const [generatingHTML, setGeneratingHTML] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingOptimizedPDF, setGeneratingOptimizedPDF] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch all properties for selection
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties?limit=1000'],
    queryFn: () => 
      fetch('/api/properties?limit=1000', {
        credentials: 'include'
      }).then(res => res.json()) as Promise<Property[]>
  });

  // Handle select all toggle
  useEffect(() => {
    if (selectAll && properties.length > 0) {
      setSelectedProperties(properties.map(p => p.id));
    } else if (!selectAll) {
      setSelectedProperties([]);
    }
  }, [selectAll, properties.length]);

  // Handle individual property selection
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

  // Format price for display
  const formatPrice = (price: number) => {
    if (!price || price === 0) return "POA";
    return `R ${price.toLocaleString()}`;
  };

  const getImageSrc = (property: Property) => {
    // Prioritize featured image if available
    const imageToUse = property.featuredImage || property.images?.[0];
    if (!imageToUse) {
      return '/api/placeholder/300/200';
    }
    
    // Ensure the image path starts with /uploads or is a full URL
    if (imageToUse.startsWith('http') || imageToUse.startsWith('/uploads')) {
      return imageToUse;
    }
    
    // If it's a relative path, prepend /uploads
    return `/uploads/${imageToUse}`;
  };

  const generateHTMLMutation = useMutation({
    mutationFn: () => fetch('/api/admin/catalogue/html', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        selectedProperties: selectedProperties.length > 0 ? selectedProperties : undefined 
      }),
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate HTML catalogue');
      // Check if response is HTML content for download
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        // Return blob for download
        return res.blob().then(blob => ({
          success: true,
          blob: blob,
          filename: 'property_catalogue.html'
        }));
      }
      return res.json();
    }),
    onMutate: () => setGeneratingHTML(true),
    onSettled: () => setGeneratingHTML(false),
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: "HTML catalogue generated successfully",
        variant: "default",
      });
      
      // Handle blob download
      if (data.blob) {
        const url = URL.createObjectURL(data.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || 'property_catalogue.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (data.downloadUrl) {
        // Fallback to opening in new tab
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate HTML catalogue",
        variant: "destructive",
      });
    }
  });

  const generatePDFMutation = useMutation({
    mutationFn: () => fetch('/api/admin/catalogue/pdf', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        selectedProperties: selectedProperties.length > 0 ? selectedProperties : undefined 
      }),
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate PDF catalogue');
      return res.json();
    }),
    onMutate: () => setGeneratingPDF(true),
    onSettled: () => setGeneratingPDF(false),
    onSuccess: (data: CatalogueResponse) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate PDF catalogue",
        variant: "destructive",
      });
    }
  });

  // Optimized PDF Generation Mutation
  const generateOptimizedPDFMutation = useMutation({
    mutationFn: () => fetch('/api/properties/optimized-catalogue', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        propertyIds: selectedProperties.length > 0 ? selectedProperties : properties.map(p => p.id),
        title: 'Premium Property Catalogue',
        clientName: 'Valued Client'
      }),
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate optimized PDF catalogue');
      return res.json();
    }),
    onMutate: () => setGeneratingOptimizedPDF(true),
    onSettled: () => setGeneratingOptimizedPDF(false),
    onSuccess: (data: CatalogueResponse) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate optimized PDF catalogue",
        variant: "destructive",
      });
    }
  });

  const handleGenerateHTML = () => {
    generateHTMLMutation.mutate();
  };

  const handleGeneratePDF = () => {
    generatePDFMutation.mutate();
  };

  const handleGenerateOptimizedPDF = () => {
    generateOptimizedPDFMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          Professional Property Catalogues
        </h1>
        <p className="text-gray-600 mt-2">
          Generate modern, eye-catching property catalogues optimized for social media marketing and professional sharing.
        </p>
      </div>

      {/* Property Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Property Selection
          </CardTitle>
          <CardDescription>
            Choose specific properties to include in your catalogue. Select individual properties, use "Select All", or generate with no selection to include all properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select All Toggle */}
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={(checked) => setSelectAll(checked === true)}
              className="h-5 w-5"
            />
            <label htmlFor="select-all" className="text-lg font-medium cursor-pointer">
              Select All Properties ({properties.length} total)
            </label>
            {selectedProperties.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedProperties.length} selected
              </Badge>
            )}
          </div>

          {/* Property Grid */}
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
                {/* Property Image */}
                <div className="relative h-32 bg-gray-100">
                  <img
                    src={getImageSrc(property)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/300/200';
                    }}
                  />
                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      className="bg-white shadow-sm pointer-events-none"
                    />
                  </div>
                  {/* Property type badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
                      {property.propertyType}
                    </Badge>
                  </div>
                  {/* Status badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant={property.status === 'sold' ? 'destructive' : 'secondary'} className="text-xs">
                      {property.status?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Property Details */}
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
                    {property.bedrooms && property.bathrooms && (
                      <div className="text-gray-500">
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No properties available for catalogue generation.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HTML Catalogue Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-bl-full opacity-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Image className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">HTML Web Catalogue</CardTitle>
                  <CardDescription>Modern web-based catalogue for social media</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Web</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Responsive design for all devices
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Modern gradients and animations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Perfect for social media sharing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Direct web links for easy distribution
              </li>
            </ul>
            <Button 
              onClick={handleGenerateHTML}
              disabled={generatingHTML}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {generatingHTML ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Generate HTML
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Social Media Images Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-bl-full opacity-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                  <Image className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Social Media Images</CardTitle>
                  <CardDescription>Ready-to-post images for social platforms</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">New!</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                Instagram, Facebook, TikTok formats
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Professional branded designs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Instant download as PNG images
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Optimized for social media engagement
              </li>
            </ul>
            <Button 
              onClick={() => window.location.href = '/admin/social-media'}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800"
            >
              <Image className="mr-2 h-4 w-4" />
              Create Social Media Images
            </Button>
          </CardContent>
        </Card>

        {/* Optimized PDF Catalogue Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-bl-full opacity-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Optimized PDF Catalogue</CardTitle>
                  <CardDescription>Premium professional catalogue with contact info</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">Premium</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Professional cover page with branding
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Table of contents and organized layout
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Peter Spurgeon contact info on every page
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Enhanced headers, footers, and styling
              </li>
            </ul>
            <Button 
              onClick={handleGenerateOptimizedPDF}
              disabled={generatingOptimizedPDF}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              {generatingOptimizedPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Optimized PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Your Catalogues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-purple-600 mb-3">HTML Catalogue Best For:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Social media posts and stories</li>
                <li>• Website integration</li>
                <li>• Email marketing campaigns</li>
                <li>• Mobile viewing and sharing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-3">PDF Catalogue Best For:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Client presentations</li>
                <li>• Professional brochures</li>
                <li>• Print marketing materials</li>
                <li>• Email attachments</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-3">Optimized PDF Best For:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Premium client portfolios</li>
                <li>• High-end property showcases</li>
                <li>• Comprehensive property catalogs</li>
                <li>• Professional marketing materials</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}