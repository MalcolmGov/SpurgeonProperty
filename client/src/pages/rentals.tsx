import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Bed, Bath, Home } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { PropertyWithAgent } from "@shared/schema";

export default function Rentals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [city, setCity] = useState("");

  const { data: properties = [], isLoading } = useQuery<PropertyWithAgent[]>({
    queryKey: ['/api/properties', { 
      listingType: 'rent',
      search: searchTerm,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      city
    }],
    refetchOnWindowFocus: false,
  });

  const handleSearch = () => {
    // The query will automatically refetch when dependencies change
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setCity("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Rental Properties
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Find your perfect rental home in South Africa's most desirable locations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search rentals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>

            {/* Property Type */}
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
              </SelectContent>
            </Select>

            {/* Min Price */}
            <Input
              placeholder="Min Price (R)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
            />

            {/* Max Price */}
            <Input
              placeholder="Max Price (R)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
            />

            {/* Bedrooms */}
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <SelectValue placeholder="Select City" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cape Town">Cape Town</SelectItem>
                <SelectItem value="Johannesburg">Johannesburg</SelectItem>
                <SelectItem value="Durban">Durban</SelectItem>
                <SelectItem value="Pretoria">Pretoria</SelectItem>
                <SelectItem value="Port Elizabeth">Port Elizabeth</SelectItem>
                <SelectItem value="Bloemfontein">Bloemfontein</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Rentals
            </Button>

            <Button 
              onClick={clearFilters}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Available Rentals
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {isLoading ? "Loading..." : `${properties.length} rental properties found`}
          </p>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Home className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No rentals found
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Try adjusting your search criteria or check back later for new listings.
            </p>
            <Button 
              onClick={clearFilters}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}