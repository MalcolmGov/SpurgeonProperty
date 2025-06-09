import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Heart, 
  Share2, 
  GitCompare,
  Calendar,
  Car,
  Eye
} from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

interface PropertyCardProps {
  property: PropertyWithAgent;
  variant?: "default" | "compact";
  onCompareToggle?: () => void;
  isInComparison?: boolean;
  canAddToComparison?: boolean;
}

export default function PropertyCard({ 
  property, 
  variant = "default",
  onCompareToggle,
  isInComparison = false,
  canAddToComparison = true
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price.replace(/[^\d.]/g, ''));
    if (numPrice >= 1000000) {
      return `R${(numPrice / 1000000).toFixed(1)}M`;
    }
    return `R${numPrice.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const mainImage = property.images?.[0] || `/api/placeholder/400/300`;

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-24 flex-shrink-0">
              <img
                src={imageError ? `/api/placeholder/400/300` : mainImage}
                alt={property.title}
                onError={handleImageError}
                className="w-full h-full object-cover rounded-lg"
              />
              {property.featured && (
                <Badge className="absolute top-1 left-1 text-xs">Featured</Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link href={`/property/${property.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary cursor-pointer truncate">
                      {property.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.suburb}, {property.city}
                  </p>
                </div>
                <div className="flex gap-1">
                  {onCompareToggle && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCompareToggle}
                      disabled={!canAddToComparison && !isInComparison}
                      className={isInComparison ? "bg-primary text-white" : ""}
                    >
                      <GitCompare className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="text-xl font-bold text-primary mb-2">
                {formatPrice(property.price)}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  <span>{property.area}m²</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={imageError ? `/api/placeholder/400/300` : mainImage}
          alt={property.title}
          onError={handleImageError}
          className="w-full h-48 object-cover"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex gap-2">
            {property.featured && (
              <Badge className="bg-yellow-500 text-white">Featured</Badge>
            )}
            <Badge className={getStatusColor(property.status || 'active')}>
              {property.status || 'Active'}
            </Badge>
          </div>
          {property.propertyType && (
            <Badge className="bg-blue-600 text-white capitalize">
              {property.propertyType.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onCompareToggle && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCompareToggle}
              disabled={!canAddToComparison && !isInComparison}
              className={`bg-white/90 backdrop-blur-sm ${isInComparison ? 'ring-2 ring-primary' : ''}`}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-white text-lg px-3 py-1">
            {formatPrice(property.price)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer line-clamp-2">
            {property.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-3 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {property.address}, {property.suburb}, {property.city}
        </p>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Bed className="h-4 w-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <p className="text-xs text-gray-500">Bedrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Bath className="h-4 w-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
            <p className="text-xs text-gray-500">Bathrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Square className="h-4 w-4" />
              <span className="text-sm">{property.area}m²</span>
            </div>
            <p className="text-xs text-gray-500">Area</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {property.yearBuilt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{property.yearBuilt}</span>
            </div>
          )}
          {property.lotSize && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{property.lotSize}m² lot</span>
            </div>
          )}
          {property.views && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{property.views} views</span>
            </div>
          )}
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Agent Info */}
        {property.agent && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <img
                src={property.agent.avatar || `/api/placeholder/32/32`}
                alt={property.agent.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{property.agent.name}</p>
                <p className="text-xs text-gray-500">Real Estate Agent</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/property/${property.id}`}>
          <Button className="w-full mt-3">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}