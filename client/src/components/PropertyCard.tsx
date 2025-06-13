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
    
    // Try to parse as number and format
    const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
    if (!isNaN(numericPrice)) {
      return `R ${numericPrice.toLocaleString('en-ZA')}`;
    }
    
    // Fallback - just add R prefix if not already there
    return `R ${price}`;
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: `${property.title} has been ${isFavorited ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleShare = async () => {
    const propertyUrl = `${window.location.origin}/properties/${property.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: propertyUrl,
        });
        return;
      } catch (error) {
        // Continue to clipboard fallback
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
                  <Link 
                    href={`/properties/${property.id}`}
                    className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                  >
                    {property.title}
                  </Link>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{property.address}</span>
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
          
          {/* Featured Badge */}
          {property.featured && (
            <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">
              Featured
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleShare}
            >
              {shareClicked ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </Button>
            {onCompareToggle && (
              <Button
                size="sm"
                variant="secondary"
                className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${
                  isInComparison ? 'bg-primary text-white' : ''
                }`}
                onClick={onCompareToggle}
                disabled={!canAddToComparison && !isInComparison}
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary/90 text-white hover:bg-primary text-lg px-3 py-1">
              {formatPrice(property.price)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title and Location */}
          <div className="mb-3">
            <Link 
              href={`/properties/${property.id}`}
              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2 mb-1 block"
            >
              {property.title}
            </Link>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{property.address}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} bath{Number(property.bathrooms) !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.area}m²</span>
            </div>
          </div>

          {/* Agent Info */}
          {property.agent && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
              {property.agent.avatar && (
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium">{property.agent.name}</p>
                {property.agent.phone && (
                  <p className="text-xs text-gray-600">{property.agent.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {feature}
                  </span>
                ))}
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
    </motion.div>
  );
}