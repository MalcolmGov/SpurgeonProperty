import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { showsBedroomsAndBathrooms } from "@/lib/property-display";
import { formatPropertyPrice } from "@/lib/property-price";

interface ChatPropertyCardProps {
  property: any;
}

const PLACEHOLDER_IMAGE = "/api/placeholder/400/300";

export default function ChatPropertyCard({ property }: ChatPropertyCardProps) {
  const [imageSrc, setImageSrc] = useState(
    property.featuredImage || property.images?.[0] || PLACEHOLDER_IMAGE
  );

  const priceLabel = `${formatPropertyPrice(property.price)}${property.listingType === "rent" ? "/mo" : ""}`;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="flex gap-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
    >
      <img
        src={imageSrc}
        alt={property.title}
        className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700"
        onError={() => setImageSrc(PLACEHOLDER_IMAGE)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
          <p className="text-xs font-medium line-clamp-2 flex-1 text-gray-900 dark:text-gray-100">
            {property.title}
          </p>
          <Badge variant="outline" className="text-xs self-start sm:ml-2 shrink-0">
            {priceLabel}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {showsBedroomsAndBathrooms(property.propertyType)
            ? `${property.bedrooms} bed, ${property.bathrooms} bath • `
            : ""}
          {property.suburb}, {property.city}
        </p>
      </div>
    </Link>
  );
}
