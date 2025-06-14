import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface WorkingPropertyFormProps {
  open: boolean;
  onClose: () => void;
}

export default function WorkingPropertyForm({ open, onClose }: WorkingPropertyFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    monthlyRates: "",
    monthlyLevies: "",
    address: "",
    suburb: "",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "",
    propertyType: "house",
    bedrooms: "3",
    bathrooms: "2",
    area: "",
    lotSize: "",
    parkingSpaces: "1",
    yearBuilt: "",
    status: "active"
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const propertyData = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price.trim(),
        monthlyRates: data.monthlyRates.trim(),
        monthlyLevies: data.monthlyLevies.trim(),
        address: data.address.trim(),
        suburb: data.suburb.trim(),
        city: data.city.trim(),
        province: data.province,
        postalCode: data.postalCode.trim(),
        propertyType: data.propertyType,
        bedrooms: parseInt(data.bedrooms) || 3,
        bathrooms: data.bathrooms,
        area: parseInt(data.area) || 0,
        lotSize: parseInt(data.lotSize) || null,
        parkingSpaces: parseInt(data.parkingSpaces) || 0,
        yearBuilt: parseInt(data.yearBuilt) || null,
        status: data.status,
        agentId: null,
        features: [],
        images: []
      };

      return await apiRequest("POST", "/api/properties", propertyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        monthlyRates: "",
        monthlyLevies: "",
        address: "",
        suburb: "",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "",
        propertyType: "house",
        bedrooms: "3",
        bathrooms: "2",
        area: "",
        lotSize: "",
        parkingSpaces: "1",
        yearBuilt: "",
        status: "active"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.address || !formData.description || !formData.area) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Property</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Modern Family Home"
                  required
                />
              </div>
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleChange("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="estate">Estate</SelectItem>
                    <SelectItem value="farm">Farm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the property in detail..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Sale Price (ZAR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="850000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlyRates">Monthly Rates (ZAR)</Label>
                <Input
                  id="monthlyRates"
                  type="number"
                  value={formData.monthlyRates}
                  onChange={(e) => handleChange("monthlyRates", e.target.value)}
                  placeholder="1200"
                />
              </div>
              <div>
                <Label htmlFor="monthlyLevies">Monthly Levies (ZAR)</Label>
                <Input
                  id="monthlyLevies"
                  type="number"
                  value={formData.monthlyLevies}
                  onChange={(e) => handleChange("monthlyLevies", e.target.value)}
                  placeholder="800"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div>
                <Label htmlFor="suburb">Suburb *</Label>
                <Input
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  placeholder="Sandton"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Johannesburg"
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Select value={formData.province} onValueChange={(value) => handleChange("province", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gauteng">Gauteng</SelectItem>
                    <SelectItem value="Western Cape">Western Cape</SelectItem>
                    <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                    <SelectItem value="Free State">Free State</SelectItem>
                    <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                    <SelectItem value="Limpopo">Limpopo</SelectItem>
                    <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="North West">North West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="2196"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select value={formData.bedrooms} onValueChange={(value) => handleChange("bedrooms", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Select value={formData.bathrooms} onValueChange={(value) => handleChange("bathrooms", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2.5">2.5</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="3.5">3.5</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="area">Floor Area (m²) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="150"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lotSize">Lot Size (m²)</Label>
                <Input
                  id="lotSize"
                  type="number"
                  value={formData.lotSize}
                  onChange={(e) => handleChange("lotSize", e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                <Select value={formData.parkingSpaces} onValueChange={(value) => handleChange("parkingSpaces", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => handleChange("yearBuilt", e.target.value)}
                  placeholder="2010"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}