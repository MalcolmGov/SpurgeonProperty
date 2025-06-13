import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
  Eye,
  Check,
  Copy
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
  const [shareClicked, setShareClicked] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: string) => {
    if (!price || price === '' || price === 'null' || price === 'undefined') {
      return 'Price on request';
    }
    
    // If price is already formatted (starts with "R"), return as is
    if (price.toString().trim().startsWith('R')) {
      return price.toString().trim();
    }
    
    // Extract numeric value from string
    const numPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    
    if (isNaN(numPrice)) {
      return 'Price on request';
    }
    
    return `R ${new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice)}`;
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

  const handleShare = async () => {
    const propertyUrl = `${window.location.origin}/properties/${property.id}`;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} - ${formatPrice(property.price)} in ${property.suburb}, ${property.city}`,
      url: propertyUrl
    };

    // Try Web Share API first (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareClicked(true);
        setTimeout(() => setShareClicked(false), 2000);
        return;
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled');
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setShareClicked(true);
      setTimeout(() => setShareClicked(false), 2000);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to your clipboard",
      });
    } catch (error) {
      // Final fallback - create a temporary input and copy
      const textArea = document.createElement('textarea');
      textArea.value = propertyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setShareClicked(true);
      setTimeout(() => setShareClicked(false), 2000);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to your clipboard",
      });
    }
  };

  const mainImage = property.images?.[0] || `/api/placeholder/400/300`;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
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
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm"
          >
            {shareClicked ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
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
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer line-clamp-2">
            {property.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-3 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {property.address}, {property.suburb}, {property.city}
        </p>

        {/* Property Details */}
        <div className="flex justify-between mb-4 py-3 border-y border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2">
              <Bed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-800 dark:text-white block">{property.bedrooms}</span>
              <span className="text-xs text-gray-500">Bedrooms</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-2">
              <Bath className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-800 dark:text-white block">{property.bathrooms}</span>
              <span className="text-xs text-gray-500">Bathrooms</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-2">
              <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-800 dark:text-white block">{property.area}m²</span>
              <span className="text-xs text-gray-500">Area</span>
            </div>
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
            <div className="flex flex-wrap gap-2">
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
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} transition-all duration-200 hover:scale-105`}
                  >
                    {feature}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/properties/${property.id}`}>
          <Button className="w-full mt-3">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}