import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, FileArchive, Plus, Trash2 } from "lucide-react";

interface BasicPropertyFormProps {
  open: boolean;
  onClose: () => void;
}

export default function BasicPropertyForm({ open, onClose }: BasicPropertyFormProps) {
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
    status: "active",
    agentId: "",
    featured: false
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch agents for selection
  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/agents"],
    enabled: open,
  });

  // Common property features list
  const COMMON_FEATURES = [
    "Swimming Pool", "Garden", "Garage", "Built-in Wardrobes", "Alarm System",
    "Air Conditioning", "Fireplace", "Study Room", "Guest Toilet", "Balcony",
    "Patio", "Security Complex", "Pet Friendly", "Furnished", "Kitchen Island",
    "Walk-in Closet", "Home Office", "Entertainment Area", "Servant Quarters",
    "Borehole", "Solar Panels", "Generator"
  ];

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First upload images if any
      let uploadedImages: string[] = [];
      if (selectedImages.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadResult = await uploadResponse.json();
          uploadedImages = uploadResult.filenames || [];
        } catch (error) {
          console.error('Image upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      }

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
        agentId: data.agentId ? parseInt(data.agentId) : null,
        featured: data.featured,
        features: features,
        images: uploadedImages
      };

      return await apiRequest("POST", "/api/properties", propertyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      
      // Reset form and close
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
        status: "active",
        agentId: "",
        featured: false
      });
      setFeatures([]);
      setSelectedImages([]);
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

  // Form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.address || !formData.description || !formData.area) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Price, Address, Description, Area)",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Feature handlers
  const addFeature = (feature: string) => {
    if (feature && !features.includes(feature)) {
      setFeatures(prev => [...prev, feature]);
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(prev => prev.filter(f => f !== feature));
  };

  const addCustomFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature("");
    }
  };

  // Image handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Invalid File",
        description: "Please select a ZIP file containing images",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const response = await fetch('/api/upload/zip', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Extracted ${result.count} images from ZIP file`,
        });
        // Note: Images are handled server-side for ZIP uploads
      } else {
        throw new Error(result.message || 'ZIP upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to process ZIP file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                rows={4}
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

          {/* Agent Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agent Assignment</h3>
            <div>
              <Label htmlFor="agentId">Assign to Agent</Label>
              <Select value={formData.agentId} onValueChange={(value) => handleChange("agentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Agent Assigned</SelectItem>
                  {(agents as any[]).map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name} - {agent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Status</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleChange("featured", checked === true)}
              />
              <Label htmlFor="featured" className="text-sm font-medium">
                Mark as Featured Property
              </Label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Featured properties will be highlighted and appear at the top of search results
            </p>
          </div>

          {/* Property Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Features</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={features.includes(feature)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addFeature(feature);
                        } else {
                          removeFeature(feature);
                        }
                      }}
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add custom feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                />
                <Button type="button" onClick={addCustomFeature} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeFeature(feature)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select Images
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => zipInputRef.current?.click()}
                  className="flex items-center gap-2"
                  disabled={isUploading}
                >
                  <FileArchive className="w-4 h-4" />
                  Upload ZIP
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                className="hidden"
              />
              
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedImages.length} image(s) selected
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs">
                          {file.name}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Uploading images...</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || isUploading}>
              {mutation.isPending ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}