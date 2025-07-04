import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar,
  TrendingUp,
  Home,
  Car,
  Zap
} from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

interface PropertyComparisonProps {
  selectedProperties: number[];
  onRemoveProperty: (propertyId: number) => void;
  onClearAll: () => void;
}

export default function PropertyComparison({ 
  selectedProperties, 
  onRemoveProperty, 
  onClearAll 
}: PropertyComparisonProps) {
  const { data: properties = [] } = useQuery<PropertyWithAgent[]>({
    queryKey: ["/api/properties"],
  });

  const comparisonProperties = properties.filter(p => 
    selectedProperties.includes(p.id)
  );

  if (selectedProperties.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Select properties to compare</p>
            <p className="text-sm text-gray-400 mt-1">
              Click the compare button on property cards to add them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: string) => {
    if (!price || price === '' || price === 'null' || price === 'undefined') {
      return 'POA';
    }
    
    // Check for POA specifically
    if (price.toString().trim().toUpperCase() === 'POA') {
      return 'POA';
    }
    
    // If price is already formatted (starts with "R"), return as is
    if (price.toString().trim().startsWith('R')) {
      return price.toString().trim();
    }
    
    // Extract numeric value from string
    const numPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    
    if (isNaN(numPrice)) {
      return 'POA';
    }
    
    return `R ${new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice)}`;
  };

  const getPropertyScore = (property: PropertyWithAgent) => {
    let score = 0;
    if (property.bedrooms >= 3) score += 20;
    if (parseFloat(property.bathrooms) >= 2) score += 15;
    if (property.area >= 100) score += 20;
    if (property.yearBuilt && property.yearBuilt >= 2010) score += 15;
    if (property.featured) score += 10;
    if (property.lotSize && property.lotSize >= 500) score += 20;
    return Math.min(score, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Property Comparison ({selectedProperties.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonProperties.map((property) => {
              const score = getPropertyScore(property);
              return (
                <div key={property.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveProperty(property.id)}
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <Card className="h-full">
                    <CardContent className="p-4">
                      {/* Property Image */}
                      <div className="relative mb-4">
                        <img
                          src={property.images?.[0] || `/api/placeholder/300/200`}
                          alt={property.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Badge 
                          className="absolute top-2 left-2"
                          variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"}
                        >
                          {score}% Match
                        </Badge>
                      </div>

                      {/* Property Details */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.suburb}, {property.city}
                          </p>
                        </div>

                        <div className="text-lg font-bold text-primary">
                          {formatPrice(property.price)}
                        </div>

                        {/* Key Specs */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 text-gray-400" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 text-gray-400" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="h-3 w-3 text-gray-400" />
                            <span>{property.area}m²</span>
                          </div>
                          {property.yearBuilt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{property.yearBuilt}</span>
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Features:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {property.features.map((feature, index) => {
                                // Create color variations for different features
                                const colors = [
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
                                  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
                                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
                                  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
                                  'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                                ];
                                const colorClass = colors[index % colors.length];
                                
                                return (
                                  <span 
                                    key={index} 
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} transition-all duration-200`}
                                  >
                                    {feature}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Property Type & Status */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <Badge variant="secondary" className="text-xs">
                            {property.propertyType}
                          </Badge>
                          <Badge 
                            variant={property.status === 'active' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {property.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Comparison Summary */}
          {comparisonProperties.length > 1 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4">Quick Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">Price Range</div>
                  <div className="text-lg font-bold">
                    {formatPrice(Math.min(...comparisonProperties.map(p => parseFloat(p.price.replace(/[^\d.]/g, '')))).toString())} - {formatPrice(Math.max(...comparisonProperties.map(p => parseFloat(p.price.replace(/[^\d.]/g, '')))).toString())}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">Average Bedrooms</div>
                  <div className="text-lg font-bold">
                    {(comparisonProperties.reduce((sum, p) => sum + p.bedrooms, 0) / comparisonProperties.length).toFixed(1)}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">Average Size</div>
                  <div className="text-lg font-bold">
                    {Math.round(comparisonProperties.reduce((sum, p) => sum + p.area, 0) / comparisonProperties.length)}m²
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">Best Match</div>
                  <div className="text-lg font-bold text-green-600">
                    {comparisonProperties.reduce((best, current) => 
                      getPropertyScore(current) > getPropertyScore(best) ? current : best
                    ).title.slice(0, 15)}...
                  </div>
                </Card>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}