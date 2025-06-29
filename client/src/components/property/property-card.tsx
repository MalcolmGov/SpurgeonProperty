import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { useState } from "react";
import type { PropertyWithAgent } from "@shared/schema";

interface PropertyCardProps {
  property: PropertyWithAgent;
  viewMode?: "grid" | "list";
}

export default function PropertyCard({ property, viewMode = "grid" }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: string) => {
    if (!price || price === '' || price === 'null' || price === 'undefined') {
      return 'Price on request';
    }
    
    // If price is already formatted (starts with "R"), return as is
    if (price.toString().trim().startsWith('R')) {
      return price.toString().trim();
    }
    
    // Extract numeric value from string
    const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    
    if (isNaN(numericPrice)) {
      return 'Price on request';
    }
    
    return `R ${new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)}`;
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  if (viewMode === "list") {
    return (
      <Link href={`/properties/${property.id}`}>
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden touch-manipulation group">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-64 h-48 flex-shrink-0 overflow-hidden">
              <img
                src={property.featuredImage || (property.images && property.images.length > 0 ? property.images[0] : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=")}
                alt={property.title}
                className="w-full h-full object-cover zoomable touch-manipulation transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
              
              {/* SOLD Overlay for List View */}
              {property.status === "sold" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl transform -rotate-12 border-4 border-white">
                    <span className="text-2xl font-black tracking-wider">SOLD</span>
                  </div>
                </div>
              )}
              
              {/* RENTED Overlay for List View */}
              {property.status === "rented" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl transform -rotate-12 border-4 border-white">
                    <span className="text-xl font-black tracking-wider">RENTED</span>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  {property.featured && (
                    <Badge className="bg-orange-primary text-white">Featured</Badge>
                  )}
                  {property.status === "sold" && (
                    <Badge className="bg-red-500 text-white">Sold</Badge>
                  )}
                  {property.status === "pending" && (
                    <Badge className="bg-yellow-500 text-white">Pending</Badge>
                  )}
                </div>
                {property.propertyType && (
                  <Badge className="bg-purple-600 text-white capitalize">
                    {property.propertyType.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 w-10 h-10 p-0 touch-manipulation bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                onClick={toggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <div className="absolute bottom-3 left-3">
                <span className="bg-purple-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>
            <CardContent className="flex-1 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {property.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 flex items-start">
                <MapPin className="w-4 h-4 text-orange-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{property.address}, {property.suburb}, {property.city}, {property.province}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                {/* Only show bedrooms/bathrooms for residential properties */}
                {!["commercial", "land"].includes(property.propertyType) && (
                  <>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2">
                        <Bed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-slate-800 dark:text-white block">{property.bedrooms}</span>
                        <span className="text-xs text-slate-500">Bedrooms</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-2">
                        <Bath className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-slate-800 dark:text-white block">{property.bathrooms}</span>
                        <span className="text-xs text-slate-500">Bathrooms</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-2">
                    <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 dark:text-white block">{property.area}m²</span>
                    <span className="text-xs text-slate-500">Area</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                {property.description}
              </p>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/properties/${property.id}`} className="block touch-manipulation">
      <Card className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
        <div className="relative overflow-hidden">
          <img
            src={property.featuredImage || (property.images && property.images.length > 0 ? property.images[0] : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=")}
            alt={property.title}
            className="w-full h-48 sm:h-64 object-cover zoomable touch-manipulation group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";
          }}
        />
        
        {/* SOLD Overlay for Grid View */}
        {property.status === "sold" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-red-600 text-white px-8 py-4 rounded-xl shadow-2xl transform -rotate-12 border-4 border-white">
              <span className="text-3xl font-black tracking-wider">SOLD</span>
            </div>
          </div>
        )}
        
        {/* RENTED Overlay for Grid View */}
        {property.status === "rented" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl transform -rotate-12 border-4 border-white">
              <span className="text-2xl font-black tracking-wider">RENTED</span>
            </div>
          </div>
        )}
        
        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex gap-2">
            {property.featured && (
              <Badge className="bg-orange-primary text-white px-2 py-1 text-xs rounded-md">Featured</Badge>
            )}
            {property.status === "sold" && (
              <Badge className="bg-red-500 text-white px-2 py-1 text-xs rounded-md">Sold</Badge>
            )}
            {property.status === "pending" && (
              <Badge className="bg-yellow-500 text-white px-2 py-1 text-xs rounded-md">Pending</Badge>
            )}
          </div>
          {property.propertyType && (
            <Badge className="bg-purple-600 text-white px-2 py-1 text-xs rounded-md capitalize">
              {property.propertyType.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3">
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg shadow-md touch-manipulation"
            onClick={toggleFavorite}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : 'text-slate-600'}`} />
          </Button>
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-purple-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Property Title */}
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        {/* Address */}
        <p className="text-slate-600 dark:text-slate-300 mb-3 flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          {property.address}, {property.suburb}, {property.city}
        </p>
        
        {/* Property Details */}
        <div className="flex flex-wrap gap-4 mb-4 py-3 border-y border-slate-200 dark:border-slate-600">
          {/* Only show bedrooms/bathrooms for residential properties */}
          {!["commercial", "land"].includes(property.propertyType) && (
            <>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2">
                  <Bed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 dark:text-white block">{property.bedrooms}</span>
                  <span className="text-xs text-slate-500">Bedrooms</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-2">
                  <Bath className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 dark:text-white block">{property.bathrooms}</span>
                  <span className="text-xs text-slate-500">Bathrooms</span>
                </div>
              </div>
            </>
          )}
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-2">
              <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-slate-800 dark:text-white block">{property.area}m²</span>
              <span className="text-xs text-slate-500">Area</span>
            </div>
          </div>
        </div>
        
        {/* Views */}
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <span>{property.views || 0} views</span>
        </div>
        
        {/* Features Tags */}
        {property.features && property.features.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
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
        )}
        
        {/* View Details Button */}
        <Button className="w-full bg-purple-primary hover:bg-purple-700 text-white touch-manipulation">
          View Details
        </Button>
      </CardContent>
    </Card>
    </Link>
  );
}
