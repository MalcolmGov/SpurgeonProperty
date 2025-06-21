import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface PropertySearchProps {
  onSearchChange?: (filters: any) => void;
}

export default function PropertySearch({ onSearchChange }: PropertySearchProps) {
  const [, setLocation] = useLocation();

  const [searchData, setSearchData] = useState({
    search: "",
    propertyType: "",
    province: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    sortBy: "date-listed",
    sortOrder: "high-to-low"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If onSearchChange is provided (homepage), don't navigate - filtering happens in real-time
    if (onSearchChange) {
      return;
    }
    
    // Build query parameters for navigation to Properties page
    const params = new URLSearchParams();
    if (searchData.search) params.set("search", searchData.search);
    if (searchData.propertyType && searchData.propertyType !== "all") params.set("propertyType", searchData.propertyType);
    if (searchData.province && searchData.province !== "all") params.set("province", searchData.province);
    if (searchData.minPrice) params.set("minPrice", searchData.minPrice);
    if (searchData.maxPrice) params.set("maxPrice", searchData.maxPrice);
    if (searchData.bedrooms && searchData.bedrooms !== "any") params.set("bedrooms", searchData.bedrooms);
    if (searchData.bathrooms && searchData.bathrooms !== "any") params.set("bathrooms", searchData.bathrooms);
    if (searchData.sortBy) params.set("sortBy", searchData.sortBy);
    if (searchData.sortOrder) params.set("sortOrder", searchData.sortOrder);
    
    // Navigate to properties page with search parameters
    const query = params.toString();
    setLocation(`/properties${query ? `?${query}` : ""}`);
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...searchData, [field]: value };
    setSearchData(newData);
    
    // If onSearchChange prop is provided (homepage), update filters in real-time
    if (onSearchChange) {
      const filters = {
        search: newData.search || "",
        propertyType: (newData.propertyType && newData.propertyType !== "all") ? newData.propertyType : "",
        province: (newData.province && newData.province !== "all") ? newData.province : "",
        minPrice: newData.minPrice ? parseInt(newData.minPrice) : undefined,
        maxPrice: newData.maxPrice ? parseInt(newData.maxPrice) : undefined,
        bedrooms: (newData.bedrooms && newData.bedrooms !== "any") ? parseInt(newData.bedrooms) : undefined,
        bathrooms: (newData.bathrooms && newData.bathrooms !== "any") ? parseFloat(newData.bathrooms) : undefined,
        // When searching, show all properties (not just featured)
        featured: newData.search ? undefined : true,
        limit: 6
      };
      onSearchChange(filters);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Property Search</h3>
            </div>

          </div>

          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Properties</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, address, suburb, city..."
                  value={searchData.search}
                  onChange={(e) => handleInputChange("search", e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Property Type</label>
              <Select value={searchData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Province */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Province</label>
              <Select value={searchData.province} onValueChange={(value) => handleInputChange("province", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  <SelectItem value="Gauteng">Gauteng</SelectItem>
                  <SelectItem value="Western Cape">Western Cape</SelectItem>
                  <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                  <SelectItem value="Free State">Free State</SelectItem>
                  <SelectItem value="Limpopo">Limpopo</SelectItem>
                  <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="North West">North West</SelectItem>
                  <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price Range: R0 - R20,000,000</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min price"
                value={searchData.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
              />
              <Input
                type="number"
                placeholder="20000000"
                value={searchData.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Advanced Options - Always Visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bedrooms</label>
              <Select value={searchData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
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

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bathrooms</label>
              <Select value={searchData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
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

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={searchData.sortBy} onValueChange={(value) => handleInputChange("sortBy", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
                  <SelectValue placeholder="Date Listed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-listed">Date Listed</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="bedrooms">Bedrooms</SelectItem>
                  <SelectItem value="size">Property Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Order</label>
              <Select value={searchData.sortOrder} onValueChange={(value) => handleInputChange("sortOrder", value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500">
                  <SelectValue placeholder="High to Low" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-to-low">High to Low</SelectItem>
                  <SelectItem value="low-to-high">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>{onSearchChange ? "Search Live" : "Search Properties"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
