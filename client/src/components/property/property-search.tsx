import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function PropertySearch() {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    priceRange: "",
    bedrooms: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchData.location) params.set("search", searchData.location);
    if (searchData.propertyType) params.set("propertyType", searchData.propertyType);
    if (searchData.bedrooms) params.set("bedrooms", searchData.bedrooms);
    
    // Handle price range
    if (searchData.priceRange) {
      const [min, max] = searchData.priceRange.split("-");
      if (min && min !== "0") params.set("minPrice", min);
      if (max && max !== "+") params.set("maxPrice", max);
    }
    
    // Navigate to properties page with search parameters
    const query = params.toString();
    setLocation(`/properties${query ? `?${query}` : ""}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-slate-700 text-sm font-medium">Location</label>
          <Input
            type="text"
            placeholder="Enter city or neighborhood"
            value={searchData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-slate-700 text-sm font-medium">Property Type</label>
          <Select value={searchData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-slate-700 text-sm font-medium">Price Range</label>
          <Select value={searchData.priceRange} onValueChange={(value) => handleInputChange("priceRange", value)}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value="0-300000">Under $300K</SelectItem>
              <SelectItem value="300000-500000">$300K - $500K</SelectItem>
              <SelectItem value="500000-1000000">$500K - $1M</SelectItem>
              <SelectItem value="1000000-+">$1M+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-slate-700 text-sm font-medium">Bedrooms</label>
          <Select value={searchData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
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
      </div>
      
      <Button 
        type="submit"
        className="w-full md:w-auto bg-orange-primary hover:bg-orange-secondary text-white px-8 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
      >
        <Search className="w-4 h-4" />
        <span>Search Properties</span>
      </Button>
    </form>
  );
}
