import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2 } from "lucide-react";
import type { PropertyWithAgent, Agent } from "@shared/schema";

interface SimplePropertyFormProps {
  property?: PropertyWithAgent | null;
  open: boolean;
  onClose: () => void;
}

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  price: "",
  address: "",
  suburb: "",
  city: "",
  province: "Gauteng",
  postalCode: "",
  propertyType: "house",
  bedrooms: "3",
  bathrooms: "2",
  area: "",
  status: "active",
  agentId: "none"
};

export default function SimplePropertyForm({ property, open, onClose }: SimplePropertyFormProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const prevOpenRef = useRef(open);
  const prevPropertyRef = useRef(property);

  // Fetch agents for selection
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
    enabled: open, // Only fetch when dialog is open
  });

  // Simplified form initialization
  useEffect(() => {
    if (open) {
      if (property) {
        // Edit mode - populate with property data
        setFormData({
          title: property.title || "",
          description: property.description || "",
          price: property.price || "",
          address: property.address || "",
          suburb: property.suburb || "",
          city: property.city || "",
          province: property.province || "Gauteng",
          postalCode: property.postalCode || "",
          propertyType: property.propertyType || "house",
          bedrooms: property.bedrooms?.toString() || "3",
          bathrooms: property.bathrooms || "2",
          area: property.area?.toString() || "",
          status: property.status || "active",
          agentId: property.agentId ? property.agentId.toString() : "none"
        });
      } else {
        // Add mode - reset to initial values
        setFormData({ ...INITIAL_FORM_DATA });
      }
      setIsInitialized(true);
    }
  }, [open, property]);

  // Enhanced close handler with state cleanup
  const handleClose = () => {
    if (!mutation.isPending) {
      setFormData({ ...INITIAL_FORM_DATA });
      setIsInitialized(false);
      onClose();
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validate required fields
      if (!data.title.trim() || !data.price.trim() || !data.address.trim() || !data.description.trim()) {
        throw new Error("Please fill in all required fields");
      }

      const propertyData = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price.trim(),
        address: data.address.trim(),
        suburb: data.suburb.trim(),
        city: data.city.trim(),
        province: data.province,
        postalCode: data.postalCode.trim(),
        propertyType: data.propertyType,
        bedrooms: parseInt(data.bedrooms) || 3,
        bathrooms: data.bathrooms,
        area: parseInt(data.area) || 0,
        status: data.status,
        agentId: data.agentId && data.agentId !== "none" ? parseInt(data.agentId) : null,
        features: [],
        images: []
      };

      if (property) {
        return await apiRequest("PUT", `/api/properties/${property.id}`, propertyData);
      } else {
        return await apiRequest("POST", "/api/properties", propertyData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: property ? "Property updated successfully" : "Property created successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error("Property form error:", error);
      const errorMessage = error.message || "Failed to save property. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (mutation.isPending) return;
    
    // Client-side validation
    if (!formData.title?.trim() || !formData.price?.trim() || !formData.address?.trim() || !formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Price, Address, Description)",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Always render when open is true, but show loading state if not initialized
  if (!open) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !mutation.isPending) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{property ? "Edit Property" : "Add New Property"}</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Modern Family Home"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="850000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the property..."
              rows={3}
              required
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>
            <div>
              <Label htmlFor="suburb">Suburb *</Label>
              <Input
                id="suburb"
                value={formData.suburb}
                onChange={(e) => handleInputChange("suburb", e.target.value)}
                placeholder="Sandton"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Johannesburg"
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder="2196"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Baths" />
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
              <Label htmlFor="area">Area (m²) *</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="150"
                required
              />
            </div>
          </div>

          {/* Status and Agent Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agentId">Assigned Agent</Label>
              <Select value={formData.agentId} onValueChange={(value) => handleInputChange("agentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={agentsLoading ? "Loading agents..." : "Select agent"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No agent assigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name} {agent.title ? `(${agent.title})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : (property ? "Update Property" : "Create Property")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}