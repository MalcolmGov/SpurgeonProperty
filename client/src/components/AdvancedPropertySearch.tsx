import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, MapPin, Home } from "lucide-react";

interface PropertySearchFilters {
  search: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  minArea: number;
  maxArea: number;
  province: string;
  city: string;
  suburb: string;
  yearBuilt: number[];
  features: string[];
  status: string;
  featured: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedPropertySearchProps {
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  isSearching?: boolean;
}

const southAfricanProvinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const propertyTypes = [
  "House", "Apartment", "Townhouse", "Duplex", "Penthouse", 
  "Villa", "Farm", "Commercial", "Industrial", "Land"
];

const popularFeatures = [
  "Swimming Pool", "Garden", "Garage", "Security", "Aircon", 
  "Fireplace", "Study", "Balcony", "Patio", "Guest Toilet",
  "Servants Quarters", "Borehole", "Solar Panels", "Alarm System",
  "Electric Fencing", "Pet Friendly", "Furnished", "Sea View"
];

const sortOptions = [
  { value: "price", label: "Price" },
  { value: "bedrooms", label: "Bedrooms" },
  { value: "area", label: "Size" },
  { value: "yearBuilt", label: "Year Built" },
  { value: "createdAt", label: "Date Listed" }
];

export default function AdvancedPropertySearch({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isSearching = false
}: AdvancedPropertySearchProps) {

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(filters.features);

  useEffect(() => {
    setSelectedFeatures(filters.features);
  }, [filters.features]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    setSelectedFeatures(newFeatures);
    handleFilterChange('features', newFeatures);
  };

  const clearAllFilters = () => {
    setSelectedFeatures([]);
    onReset();
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.propertyType && filters.propertyType !== "all") count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 20000000) count++;
    if (filters.bedrooms && filters.bedrooms !== "any") count++;
    if (filters.bathrooms && filters.bathrooms !== "any") count++;
    if (filters.province && filters.province !== "all") count++;
    if (filters.city) count++;
    if (filters.suburb) count++;
    if (filters.minArea > 0) count++;
    if (filters.maxArea < 1000) count++;
    if (filters.yearBuilt[0] > 1900 || filters.yearBuilt[1] < 2024) count++;
    if (filters.features.length > 0) count++;
    if (filters.featured) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Property Search
            {activeFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFiltersCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Search Properties</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by title, address, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="province">Province</Label>
            <Select value={filters.province} onValueChange={(value) => handleFilterChange('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {southAfricanProvinces.map(province => (
                  <SelectItem key={province} value={province.toLowerCase().replace(/\s+/g, '-')}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Price Range: R{filters.minPrice.toLocaleString()} - R{filters.maxPrice.toLocaleString()}</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Input
                type="number"
                placeholder="Min price"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 20000000)}
              />
            </div>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
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
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sortOrder">Order</Label>
            <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Low to High</SelectItem>
                <SelectItem value="desc">High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Separator />
        <div className="space-y-6">
            
            {/* Location Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city name"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="suburb">Suburb</Label>
                  <Input
                    id="suburb"
                    placeholder="Enter suburb name"
                    value={filters.suburb}
                    onChange={(e) => handleFilterChange('suburb', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Property Size */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Size (m²)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Area</Label>
                  <Input
                    type="number"
                    placeholder="Min m²"
                    value={filters.minArea || ''}
                    onChange={(e) => handleFilterChange('minArea', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Max Area</Label>
                  <Input
                    type="number"
                    placeholder="Max m²"
                    value={filters.maxArea || ''}
                    onChange={(e) => handleFilterChange('maxArea', parseInt(e.target.value) || 1000)}
                  />
                </div>
              </div>
            </div>

            {/* Year Built Range */}
            <div>
              <h4 className="font-semibold mb-3">Year Built: {filters.yearBuilt[0]} - {filters.yearBuilt[1]}</h4>
              <Slider
                value={filters.yearBuilt}
                onValueChange={(value) => handleFilterChange('yearBuilt', value)}
                min={1900}
                max={2024}
                step={1}
                className="w-full"
              />
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-3">Features & Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {popularFeatures.map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Switch
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm">{feature}</Label>
                  </div>
                ))}
              </div>
              {selectedFeatures.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Selected features:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeatures.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                        <button
                          onClick={() => handleFeatureToggle(feature)}
                          className="ml-1 hover:bg-gray-300 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div>
              <h4 className="font-semibold mb-3">Additional Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => handleFilterChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured properties only</Label>
                </div>
                
                <div>
                  <Label htmlFor="status">Property Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
        </div>

        {/* Search Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={onSearch} 
            disabled={isSearching}
            className="flex-1"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Properties
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}