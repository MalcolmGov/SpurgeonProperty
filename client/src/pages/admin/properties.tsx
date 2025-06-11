import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import PropertyForm from "@/components/forms/property-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/hooks/use-properties";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Eye, Trash, Download } from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

export default function AdminProperties() {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: properties, isLoading } = useProperties({
    search: searchQuery,
    status: statusFilter || undefined,
    propertyType: typeFilter || undefined,
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (property: PropertyWithAgent) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deletePropertyMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "sold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "rented":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    }
  };

  const formatPrice = (price: string) => {
    if (!price || price === '' || price === 'null' || price === 'undefined') {
      return 'Price on request';
    }
    
    // Handle both string and numeric price values
    const numericPrice = typeof price === 'string' ? parseFloat(price) : parseFloat(String(price));
    
    if (isNaN(numericPrice)) {
      return 'Price on request';
    }
    
    return `R ${new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Property Management</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Managing {properties?.length || 0} properties
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingProperty(null);
                setShowPropertyForm(true);
              }}
              className="bg-purple-primary hover:bg-purple-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </div>
          
          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Search Properties
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by title, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Property Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Properties
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  Showing {properties?.length || 0} properties
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="bg-slate-200 dark:bg-slate-700 w-16 h-16 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded animate-pulse" />
                          <div className="bg-slate-200 dark:bg-slate-700 h-3 rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {properties.map((property) => (
                        <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100"}
                                alt={property.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {property.title}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {property.city}, {property.state}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`capitalize ${getStatusColor(property.status)}`}>
                              {property.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                            {formatPrice(property.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {property.agent ? (
                              <div className="flex items-center">
                                <img
                                  src={property.agent.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40"}
                                  alt={property.agent.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div className="ml-2 text-sm text-slate-900 dark:text-white">
                                  {property.agent.name}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {property.views || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(property)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/property/${property.id}`, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(property.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 dark:text-slate-600">
                    <Search className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                    <p>Create your first property or adjust your search filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}
