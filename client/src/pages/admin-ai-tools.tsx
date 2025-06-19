import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AIPropertyDescriptionGenerator from "@/components/AIPropertyDescriptionGenerator";
import AdminSidebar from "@/components/admin/sidebar";
import { Sparkles, Building2, TrendingUp, Users } from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

export default function AdminAIToolsPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const { data: properties = [], isLoading } = useQuery<PropertyWithAgent[]>({
    queryKey: ["/api/properties"],
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const stats = {
    totalProperties: properties.length,
    publishedProperties: properties.filter(p => p.status === 'active').length,
    draftProperties: properties.filter(p => p.status === 'draft').length,
    featuredProperties: properties.filter(p => p.featured).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Tools</h1>
            <p className="text-gray-600">
              Generate compelling property descriptions and marketing content using AI
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">{stats.publishedProperties}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.draftProperties}</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.featuredProperties}</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select
                      value={selectedPropertyId?.toString() || ""}
                      onValueChange={(value) => setSelectedPropertyId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a property to work with" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{property.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {property.suburb}, {property.city}
                              </Badge>
                              <Badge 
                                variant={property.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {property.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProperty && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPropertyId(null)}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                {selectedProperty && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">{selectedProperty.title}</h4>
                          <p className="text-sm text-blue-700 mb-1">
                            <span className="font-medium">Location:</span> {selectedProperty.address}, {selectedProperty.suburb}, {selectedProperty.city}, {selectedProperty.province}
                          </p>
                          <p className="text-sm text-blue-700 mb-1">
                            <span className="font-medium">Type:</span> {selectedProperty.propertyType}
                          </p>
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Price:</span> {selectedProperty.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 mb-1">
                            <span className="font-medium">Bedrooms:</span> {selectedProperty.bedrooms}
                          </p>
                          <p className="text-sm text-blue-700 mb-1">
                            <span className="font-medium">Bathrooms:</span> {selectedProperty.bathrooms}
                          </p>
                          <p className="text-sm text-blue-700 mb-1">
                            <span className="font-medium">Area:</span> {selectedProperty.area}m²
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Badge variant={selectedProperty.status === 'active' ? 'default' : 'secondary'}>
                              {selectedProperty.status}
                            </Badge>
                            {selectedProperty.featured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Description Generator */}
          <AIPropertyDescriptionGenerator 
            property={selectedProperty}
            onDescriptionGenerated={(description) => {
              console.log("Generated description:", description);
            }}
            onDescriptionEnhanced={(description) => {
              console.log("Enhanced description:", description);
            }}
          />
        </div>
      </main>
    </div>
  );
}