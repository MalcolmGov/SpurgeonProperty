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
  Copy,
  Phone
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

  const getImageSrc = () => {
    if (imageError) {
      return `/api/placeholder/400/300`;
    }
    
    const firstImage = property.images?.[0];
    if (!firstImage) {
      return `/api/placeholder/400/300`;
    }
    
    // Ensure the image path starts with /uploads or is a full URL
    if (firstImage.startsWith('http') || firstImage.startsWith('/uploads')) {
      return firstImage;
    }
    
    // If it's a relative path, prepend /uploads
    return `/uploads/${firstImage}`;
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

  const mainImage = getImageSrc();

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.97 }}
        className="group"
      >
        <Card className="overflow-hidden bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-md hover:shadow-xl transition-all duration-400 group-hover:shadow-purple-500/10">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Premium Compact Image */}
              <div className="relative w-32 h-24 sm:w-36 sm:h-28 flex-shrink-0 overflow-hidden rounded-xl">
                <img
                  src={mainImage}
                  alt={property.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {property.featured && (
                  <Badge className="absolute top-1 left-1 text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md">
                    ⭐ Featured
                  </Badge>
                )}
                
                {/* Compact Price Overlay */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold text-center">
                    {formatPrice(property.price)}
                  </div>
                </div>
              </div>

              {/* Premium Compact Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="font-bold text-base leading-tight hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-orange-500 hover:bg-clip-text transition-all duration-300 line-clamp-2 group-hover:text-purple-600"
                  >
                    {property.title}
                  </Link>
                </div>

                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{property.address}</span>
                </div>

                {/* Compact Property Stats */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                      <Bed className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                      <Bath className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                      <Square className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{property.area}m²</span>
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
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className="group"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:shadow-purple-500/10">
        <div className="relative overflow-hidden">
          {/* Premium Image with Overlay */}
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <img
              src={mainImage}
              alt={property.title}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Premium Featured Badge */}
          {property.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg text-sm font-semibold px-3 py-1.5 rounded-xl">
                ⭐ Featured
              </Badge>
            </div>
          )}

          {/* Premium Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-0 shadow-lg rounded-xl"
                onClick={handleFavorite}
              >
                <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-0 shadow-lg rounded-xl"
                onClick={handleShare}
              >
                {shareClicked ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Share2 className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </motion.div>
            {onCompareToggle && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="sm"
                  variant="secondary"
                  className={`h-10 w-10 p-0 backdrop-blur-sm border-0 shadow-lg rounded-xl transition-all ${
                    isInComparison 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                      : 'bg-white/90 hover:bg-white text-slate-600'
                  }`}
                  onClick={onCompareToggle}
                  disabled={!canAddToComparison && !isInComparison}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Premium Price Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
              <span className="text-lg font-bold tracking-tight">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>

          {/* Property Type Badge */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <Badge className="bg-white/90 text-slate-700 border-0 shadow-lg backdrop-blur-sm px-3 py-1 rounded-lg">
              {property.propertyType}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Premium Title and Location */}
          <div className="space-y-2">
            <Link 
              href={`/properties/${property.id}`}
              className="font-bold text-xl leading-tight hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-orange-500 hover:bg-clip-text transition-all duration-300 line-clamp-2 block group-hover:text-purple-600"
            >
              {property.title}
            </Link>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium truncate">{property.address}</span>
            </div>
          </div>

          {/* Premium Property Details */}
          <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-1">
                <Bed className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bedrooms</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{property.bedrooms}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-1">
                <Bath className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bathrooms</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{property.bathrooms}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-1">
                <Square className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Area</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{property.area}m²</span>
            </div>
          </div>



          {/* Premium Features */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Features</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Premium Action Button */}
          <Link href={`/properties/${property.id}`} className="block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <Eye className="h-4 w-4 mr-2" />
                View Property Details
              </Button>
            </motion.div>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}