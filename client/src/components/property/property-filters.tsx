import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PropertyFiltersProps {
  filters: {
    propertyType: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    city: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const bedroomOptions = ["1", "2", "3", "4", "5+"];
  const bathroomOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"];
  const propertyTypes = [
    { id: "house", label: "House" },
    { id: "apartment", label: "Apartment" },
    { id: "condo", label: "Condo" },
    { id: "townhouse", label: "Townhouse" }
  ];

  const clearFilters = () => {
    Object.keys(filters).forEach(key => {
      onFilterChange(key, "");
    });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Price Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Property Type
          </Label>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.propertyType === type.id}
                  onCheckedChange={(checked) => 
                    onFilterChange("propertyType", checked ? type.id : "")
                  }
                />
                <Label htmlFor={type.id} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Bedrooms
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filters.bedrooms === "" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("bedrooms", "")}
              className={filters.bedrooms === "" ? "bg-purple-primary" : ""}
            >
              Any
            </Button>
            {bedroomOptions.map((bedroom) => (
              <Button
                key={bedroom}
                variant={filters.bedrooms === bedroom ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange("bedrooms", bedroom)}
                className={filters.bedrooms === bedroom ? "bg-purple-primary" : ""}
              >
                {bedroom}
              </Button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Bathrooms
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filters.bathrooms === "" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("bathrooms", "")}
              className={filters.bathrooms === "" ? "bg-purple-primary" : ""}
            >
              Any
            </Button>
            {bathroomOptions.map((bathroom) => (
              <Button
                key={bathroom}
                variant={filters.bathrooms === bathroom ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange("bathrooms", bathroom)}
                className={filters.bathrooms === bathroom ? "bg-purple-primary" : ""}
              >
                {bathroom}
              </Button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            City
          </Label>
          <Input
            type="text"
            placeholder="Enter city"
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
