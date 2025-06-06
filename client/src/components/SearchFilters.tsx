import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import type { PropertySearchFilters } from "@/lib/types";

interface SearchFiltersProps {
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 2000000,
  ]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State, ZIP"
            value={filters.location || ""}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            value={filters.propertyType || ""}
            onValueChange={(value) => handleFilterChange("propertyType", value || undefined)}
          >
            <SelectTrigger>
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

        {/* Price Range */}
        <div className="space-y-4">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={2000000}
              min={0}
              step={10000}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <div className="grid grid-cols-5 gap-2">
            {["Any", "1+", "2+", "3+", "4+"].map((label, index) => (
              <Button
                key={label}
                variant={
                  (index === 0 && !filters.bedrooms) ||
                  filters.bedrooms === index
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  handleFilterChange("bedrooms", index === 0 ? undefined : index)
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <div className="grid grid-cols-5 gap-2">
            {["Any", "1+", "2+", "3+", "4+"].map((label, index) => (
              <Button
                key={label}
                variant={
                  (index === 0 && !filters.bathrooms) ||
                  filters.bathrooms === index
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  handleFilterChange("bathrooms", index === 0 ? undefined : index)
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-2">
          <Label>Square Footage</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Min sq ft"
              type="number"
              value={filters.minArea || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minArea",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
            <Input
              placeholder="Max sq ft"
              type="number"
              value={filters.maxArea || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxArea",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onApplyFilters}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Apply Filters
          </Button>
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="w-full"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
