import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Bed, Bath, Square, Filter, X } from "lucide-react";
import { useProperties } from "@/hooks/use-properties";
import type { PropertyWithAgent } from "@shared/schema";
import { Link } from "wouter";

// Fix for default Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom property marker icons
const createPropertyIcon = (price: string, propertyType: string) => {
  const color = '#8b5cf6'; // Purple color for all property types

  const formatPrice = (priceStr: string) => {
    if (!priceStr) return 'POA';
    
    // If price is already formatted (starts with "R"), return shortened version
    if (priceStr.toString().trim().startsWith('R')) {
      const numPrice = parseFloat(priceStr.toString().replace(/[^\d.]/g, ''));
      if (isNaN(numPrice)) return 'POA';
      if (numPrice >= 1000000) {
        return `R${(numPrice / 1000000).toFixed(1)}M`;
      }
      return `R${numPrice.toLocaleString()}`;
    }
    
    const numPrice = parseFloat(priceStr.toString().replace(/[^\d.]/g, ''));
    if (isNaN(numPrice)) {
      return 'POA';
    }
    if (numPrice >= 1000000) {
      return `R${(numPrice / 1000000).toFixed(1)}M`;
    }
    return `R${numPrice.toLocaleString()}`;
  };

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        min-width: 60px;
      ">
        ${formatPrice(price)}
      </div>
    `,
    className: 'custom-property-marker',
    iconSize: [60, 24],
    iconAnchor: [30, 24],
  });
};

interface PropertyMapFilters {
  search: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  province: string;
  city: string;
}

// Map bounds updater component
function MapBoundsUpdater({ properties }: { properties: PropertyWithAgent[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(p => [parseFloat(p.latitude!), parseFloat(p.longitude!)])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, properties]);

  return null;
}

export default function PropertyMapExplorer() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PropertyMapFilters>({
    search: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 10000000,
    bedrooms: "",
    bathrooms: "",
    province: "",
    city: ""
  });

  const { data: properties = [], isLoading } = useProperties({
    search: filters.search || undefined,
    propertyType: filters.propertyType || undefined,
    minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
    bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
    bathrooms: filters.bathrooms ? parseFloat(filters.bathrooms) : undefined,
    city: filters.city || undefined,
    limit: 100
  });

  // Filter properties with valid coordinates
  const mappableProperties = useMemo(() => {
    return properties.filter(property => 
      property.latitude && 
      property.longitude && 
      parseFloat(property.latitude) !== 0 && 
      parseFloat(property.longitude) !== 0
    );
  }, [properties]);

  // South Africa center coordinates
  const southAfricaCenter: [number, number] = [-28.4793, 24.6727];

  const handleFilterChange = (key: keyof PropertyMapFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 10000000,
      bedrooms: "",
      bathrooms: "",
      province: "",
      city: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== "" && value !== 0 && value !== 10000000
  );

  if (isLoading) {
    return (
      <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-primary mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading property map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-primary" />
              Property Map Explorer
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {Object.values(filters).filter(v => v !== "" && v !== 0 && v !== 10000000).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {mappableProperties.length} properties on the map
          </p>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="cluster_home">Cluster Home</SelectItem>
                    <SelectItem value="farm">Farm</SelectItem>
                    <SelectItem value="vacant_land">Vacant Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Price Range: R{filters.minPrice.toLocaleString()} - R{filters.maxPrice.toLocaleString()}
                </label>
                <div className="px-3">
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => {
                      handleFilterChange("minPrice", min);
                      handleFilterChange("maxPrice", max);
                    }}
                    max={10000000}
                    min={0}
                    step={50000}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: "600px", width: "100%" }}>
            <MapContainer
              center={southAfricaCenter}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapBoundsUpdater properties={mappableProperties} />
              
              <MarkerClusterGroup>
                {mappableProperties.map((property) => (
                  <Marker
                    key={property.id}
                    position={[parseFloat(property.latitude!), parseFloat(property.longitude!)]}
                    icon={createPropertyIcon(property.price, property.propertyType)}
                  >
                    <Popup maxWidth={300}>
                      <div className="p-2">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg leading-tight">{property.title}</h3>
                          <Badge variant="secondary" className="ml-2 capitalize text-xs">
                            {property.propertyType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-2xl font-bold text-orange-primary mb-2">
                          {(() => {
                            if (!property.price) return 'Price on request';
                            
                            // If price is already formatted (starts with "R"), return as is
                            if (property.price.toString().trim().startsWith('R')) {
                              return property.price.toString().trim();
                            }
                            
                            const numPrice = parseFloat(property.price.toString().replace(/[^\d.]/g, ''));
                            return isNaN(numPrice) ? 'Price on request' : `R ${numPrice.toLocaleString()}`;
                          })()}
                        </p>
                        
                        <p className="text-sm text-slate-600 mb-3 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.address}, {property.suburb}, {property.city}
                        </p>
                        
                        <div className="flex justify-between text-sm text-slate-600 mb-3">
                          <span className="flex items-center">
                            <Bed className="w-3 h-3 mr-1" />
                            {property.bedrooms} beds
                          </span>
                          <span className="flex items-center">
                            <Bath className="w-3 h-3 mr-1" />
                            {property.bathrooms} baths
                          </span>
                          <span className="flex items-center">
                            <Square className="w-3 h-3 mr-1" />
                            {property.area}m²
                          </span>
                        </div>
                        
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Property Type Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { type: 'house', color: '#22c55e', label: 'House' },
              { type: 'apartment', color: '#3b82f6', label: 'Apartment' },
              { type: 'townhouse', color: '#f59e0b', label: 'Townhouse' },
              { type: 'flat', color: '#8b5cf6', label: 'Flat' },
              { type: 'cluster_home', color: '#ef4444', label: 'Cluster Home' },
              { type: 'farm', color: '#84cc16', label: 'Farm' },
              { type: 'vacant_land', color: '#6b7280', label: 'Vacant Land' }
            ].map(({ type, color, label }) => (
              <div key={type} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}