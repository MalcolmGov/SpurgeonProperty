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
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch all properties for selection
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => 
      fetch('/api/properties?limit=100', {
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
  }, [selectAll, properties]);

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
      return res.json();
    }),
    onMutate: () => setGeneratingHTML(true),
    onSettled: () => setGeneratingHTML(false),
    onSuccess: (data: CatalogueResponse) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
      
      // Open HTML catalogue in new tab
      window.open(data.downloadUrl, '_blank');
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

  const handleGenerateHTML = () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property or use 'Select All' to include all properties.",
        variant: "destructive",
      });
      return;
    }
    generateHTMLMutation.mutate();
  };

  const handleGeneratePDF = () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property or use 'Select All' to include all properties.",
        variant: "destructive",
      });
      return;
    }
    generatePDFMutation.mutate();
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
            Choose specific properties to include in your catalogue. Select individual properties or use "Select All" for complete listings.
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
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProperties.includes(property.id)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePropertySelection(property.id)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    className="mt-1 pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-purple-600" />
                      <Badge variant="outline" className="text-xs">
                        {property.propertyType}
                      </Badge>
                      <Badge variant={property.status === 'sold' ? 'destructive' : 'secondary'} className="text-xs">
                        {property.status?.toUpperCase()}
                      </Badge>
                    </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={generatingHTML || selectedProperties.length === 0}
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

        {/* PDF Catalogue Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-bl-full opacity-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Professional PDF</CardTitle>
                  <CardDescription>High-quality PDF for printing and sharing</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Print</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Professional typography and layout
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Optimized for high-quality printing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                Property cards with detailed specs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Branded with Spurgeon Property colors
              </li>
            </ul>
            <Button 
              onClick={handleGeneratePDF}
              disabled={generatingPDF || selectedProperties.length === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate PDF
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}