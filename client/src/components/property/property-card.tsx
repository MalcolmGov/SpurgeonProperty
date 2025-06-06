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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
                src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                alt={property.title}
                className="w-full h-full object-cover"
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
                {property.address}, {property.city}, {property.state}
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
            src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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
            {property.city}, {property.state}
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
