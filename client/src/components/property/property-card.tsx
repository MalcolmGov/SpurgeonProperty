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
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  if (viewMode === "list") {
    return (
      <Link href={`/property/${property.id}`}>
        <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="flex">
            <div className="relative w-64 h-48 flex-shrink-0">
              <img
                src={property.images && property.images.length > 0 ? property.images[0] : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo="}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
              <div className="absolute top-3 left-3">
                {property.featured && (
                  <Badge className="bg-orange-primary text-white">Featured</Badge>
                )}
                {property.status === "sold" && (
                  <Badge className="bg-red-500 text-white ml-2">Sold</Badge>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 w-8 h-8 p-0"
                onClick={toggleFavorite}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <div className="absolute bottom-3 left-3">
                <span className="bg-purple-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>
            <CardContent className="flex-1 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {property.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4 flex items-center">
                <MapPin className="w-4 h-4 text-orange-primary mr-2" />
                {property.address}, {property.suburb}, {property.city}, {property.province}
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms} Beds
                </span>
                <span className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} Baths
                </span>
                <span className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  {property.area.toLocaleString()} sq ft
                </span>
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
    <Link href={`/property/${property.id}`}>
      <Card className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div className="relative">
          <img
            src={property.images && property.images.length > 0 ? property.images[0] : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo="}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNzUgMTQwIDUwIDUwIDI1LTI1IDUwIDUwVjE4MEgxNzVWMTQwWiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTYwIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";
            }}
          />
          <div className="absolute top-4 left-4 flex gap-2">
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
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 w-10 h-10 p-0 bg-white/80 hover:bg-white"
            onClick={toggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : 'text-slate-600'}`} />
          </Button>
          <div className="absolute bottom-4 left-4">
            <span className="bg-purple-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
            {property.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4 flex items-center">
            <MapPin className="w-4 h-4 text-orange-primary mr-2" />
            {property.suburb}, {property.city}, {property.province}
          </p>
          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <span className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {property.bedrooms} Beds
            </span>
            <span className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {property.bathrooms} Baths
            </span>
            <span className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              {property.area.toLocaleString()} sq ft
            </span>
          </div>
          <Button className="w-full bg-slate-100 hover:bg-purple-primary hover:text-white text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-purple-primary dark:hover:text-white transition-all duration-300">
            View Details
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
