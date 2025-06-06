import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  variant?: "default" | "compact";
}

export default function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const formatArea = (area: number) => {
    return new Intl.NumberFormat("en-US").format(area);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "sold":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const mainImage = property.images[0] || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800";

  if (variant === "compact") {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50">
        <div className="relative">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            {property.isFeatured && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                setIsFavorited(!isFavorited);
              }}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              {formatPrice(property.price)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-orange-500" />
            {property.city}, {property.state}
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Bed className="w-3 h-3 mr-1" />
              {property.bedrooms}
            </span>
            <span className="flex items-center">
              <Bath className="w-3 h-3 mr-1" />
              {property.bathrooms}
            </span>
            <span className="flex items-center">
              <Square className="w-3 h-3 mr-1" />
              {formatArea(property.area)} sq ft
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50">
      <div className="relative">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.isFeatured && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
              Featured
            </Badge>
          )}
          <Badge className={getStatusColor(property.status)}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">
            {formatPrice(property.price)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {property.title}
        </h3>
        <p className="text-muted-foreground mb-4 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
          {property.city}, {property.state}
        </p>
        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
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
            {formatArea(property.area)} sq ft
          </span>
        </div>
        <Link href={`/properties/${property.id}`}>
          <Button className="w-full bg-slate-100 hover:bg-primary hover:text-primary-foreground text-slate-700 transition-all duration-300">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
