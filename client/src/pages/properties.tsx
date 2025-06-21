import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/property/property-card-skeleton";
import AdvancedPropertySearch from "@/components/AdvancedPropertySearch";
import PropertyComparison from "@/components/PropertyComparison";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, ChevronLeft, ChevronRight, GitCompare } from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

export default function Properties() {
  const [location] = useLocation();
  
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    propertyType: "all",
    minPrice: 0,
    maxPrice: 20000000,
    bedrooms: "any",
    bathrooms: "any",
    minArea: 0,
    maxArea: 1000,
    province: "all",
    city: "",
    suburb: "",
    yearBuilt: [1900, 2024],
    features: [] as string[],
    status: "all",
    featured: false,
    sortBy: "createdAt",
    sortOrder: "desc" as 'asc' | 'desc'
  });

  // Apply URL parameters on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const newFilters = { ...searchFilters };
    
    if (urlParams.get('search')) newFilters.search = urlParams.get('search') || "";
    if (urlParams.get('propertyType')) newFilters.propertyType = urlParams.get('propertyType') || "all";
    if (urlParams.get('province')) newFilters.province = urlParams.get('province') || "all";
    if (urlParams.get('minPrice')) newFilters.minPrice = parseInt(urlParams.get('minPrice') || "0");
    if (urlParams.get('maxPrice')) newFilters.maxPrice = parseInt(urlParams.get('maxPrice') || "20000000");
    if (urlParams.get('bedrooms')) newFilters.bedrooms = urlParams.get('bedrooms') || "any";
    if (urlParams.get('bathrooms')) newFilters.bathrooms = urlParams.get('bathrooms') || "any";
    if (urlParams.get('sortBy')) newFilters.sortBy = urlParams.get('sortBy') || "createdAt";
    if (urlParams.get('sortOrder')) newFilters.sortOrder = urlParams.get('sortOrder') as 'asc' | 'desc' || "desc";
    
    setSearchFilters(newFilters);
  }, [location]);
  
  const [comparisonProperties, setComparisonProperties] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 12;

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchFilters.search) params.append('search', searchFilters.search);
    if (searchFilters.propertyType !== "all") params.append('propertyType', searchFilters.propertyType.toLowerCase());
    if (searchFilters.minPrice > 0) params.append('minPrice', searchFilters.minPrice.toString());
    if (searchFilters.maxPrice < 20000000) params.append('maxPrice', searchFilters.maxPrice.toString());
    if (searchFilters.bedrooms !== "any") params.append('bedrooms', searchFilters.bedrooms);
    if (searchFilters.bathrooms !== "any") params.append('bathrooms', searchFilters.bathrooms);
    if (searchFilters.city) params.append('city', searchFilters.city);
    if (searchFilters.province !== "all") params.append('province', searchFilters.province.toLowerCase().replace(/\s+/g, '-'));
    if (searchFilters.status !== "all") params.append('status', searchFilters.status);
    if (searchFilters.featured) params.append('featured', 'true');
    
    return params.toString();
  };

  const { data: filteredProperties = [], isLoading } = useQuery<PropertyWithAgent[]>({
    queryKey: ["/api/properties", searchFilters.search, searchFilters.propertyType, searchFilters.minPrice, searchFilters.maxPrice, searchFilters.bedrooms, searchFilters.bathrooms, searchFilters.city, searchFilters.province, searchFilters.status, searchFilters.featured],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const url = queryString ? `/api/properties?${queryString}` : '/api/properties';
      console.log('Frontend making API call:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const order = searchFilters.sortOrder === 'asc' ? 1 : -1;
    
    switch (searchFilters.sortBy) {
      case 'price':
        const priceA = parseFloat(a.price.replace(/[^\d.]/g, ''));
        const priceB = parseFloat(b.price.replace(/[^\d.]/g, ''));
        return (priceA - priceB) * order;
      case 'bedrooms':
        return (a.bedrooms - b.bedrooms) * order;
      case 'area':
        return (a.area - b.area) * order;
      case 'yearBuilt':
        const yearA = a.yearBuilt || 0;
        const yearB = b.yearBuilt || 0;
        return (yearA - yearB) * order;
      default:
        return order;
    }
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);

  const handleFilterChange = (newFilters: typeof searchFilters) => {
    console.log('Properties page: Filter change received:', newFilters);
    setSearchFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleResetFilters = () => {
    setSearchFilters({
      search: "",
      propertyType: "all",
      minPrice: 0,
      maxPrice: 20000000,
      bedrooms: "any",
      bathrooms: "any",
      minArea: 0,
      maxArea: 1000,
      province: "all",
      city: "",
      suburb: "",
      yearBuilt: [1900, 2024],
      features: [],
      status: "all",
      featured: false,
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    setCurrentPage(1);
  };

  const handleCompareToggle = (propertyId: number) => {
    setComparisonProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : prev.length < 4 ? [...prev, propertyId] : prev
    );
  };

  const handleRemoveFromComparison = (propertyId: number) => {
    setComparisonProperties(prev => prev.filter(id => id !== propertyId));
  };

  const handleClearComparison = () => {
    setComparisonProperties([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Advanced Property Search
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {isLoading ? 'Loading properties...' : `Found ${sortedProperties.length} properties`}
          </p>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search & Browse
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Compare Properties
              {comparisonProperties.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {comparisonProperties.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Advanced Search Component */}
            <AdvancedPropertySearch
              filters={searchFilters}
              onFiltersChange={handleFilterChange}
              onSearch={handleSearch}
              onReset={handleResetFilters}
              isSearching={isSearching}
            />

            {/* Results Summary and View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} of {sortedProperties.length} results
                </p>
                {comparisonProperties.length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <GitCompare className="h-3 w-3" />
                    {comparisonProperties.length} selected for comparison
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Property Grid/List */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} viewMode={viewMode} index={i} />
                ))}
              </div>
            ) : paginatedProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria or clearing the filters.
                </p>
                <Button onClick={handleResetFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant={viewMode === "list" ? "compact" : "default"}
                    onCompareToggle={() => handleCompareToggle(property.id)}
                    isInComparison={comparisonProperties.includes(property.id)}
                    canAddToComparison={comparisonProperties.length < 4}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <PropertyComparison
              selectedProperties={comparisonProperties}
              onRemoveProperty={handleRemoveFromComparison}
              onClearAll={handleClearComparison}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}