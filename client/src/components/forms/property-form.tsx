import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPropertySchema } from "@shared/schema";
import { X, Upload, Plus } from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

interface PropertyFormProps {
  property?: PropertyWithAgent | null;
  onClose: () => void;
}

export default function PropertyForm({ property, onClose }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    propertyType: "house",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    lotSize: "",
    yearBuilt: "",
    parking: "",
    features: [] as string[],
    images: [] as string[],
    status: "active",
    agentId: "unassigned",
    featured: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch agents for the dropdown
  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ["/api/agents"],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        address: property.address,
        suburb: property.suburb,
        city: property.city,
        province: property.province,
        postalCode: property.postalCode,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms,
        area: property.area.toString(),
        lotSize: property.lotSize || "",
        yearBuilt: property.yearBuilt?.toString() || "",
        parking: property.parking || "",
        features: property.features || [],
        images: property.images || [],
        status: property.status,
        agentId: property.agentId?.toString() || "unassigned",
        featured: property.featured || false
      });
    }
  }, [property]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        propertyType: data.propertyType,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: data.bathrooms,
        area: parseInt(data.area),
        lotSize: data.lotSize || undefined,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : undefined,
        parking: data.parking || undefined,
        features: data.features,
        images: data.images,
        status: data.status,
        agentId: data.agentId && data.agentId !== "unassigned" ? parseInt(data.agentId) : undefined,
        featured: data.featured
      };

      // Validate data
      const validatedData = insertPropertySchema.parse(propertyData);

      if (property) {
        await apiRequest("PUT", `/api/properties/${property.id}`, validatedData);
      } else {
        await apiRequest("POST", "/api/properties", validatedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: property ? "Property updated successfully" : "Property created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save property. Please check all fields.",
        variant: "destructive",
      });
      console.error("Property form error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    const feature = prompt("Enter feature:");
    if (feature && feature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const [isUploading, setIsUploading] = useState(false);

  const addImageUrl = () => {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl && imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadFormData = new FormData();
    Array.from(files).forEach(file => {
      uploadFormData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls]
        }));
        toast({ 
          title: "Success", 
          description: result.message || "Images uploaded successfully" 
        });
        // Clear the input
        event.target.value = '';
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({ 
        title: "Invalid file", 
        description: "Please select a ZIP file",
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('images', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.urls) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...result.urls]
          }));
          toast({ 
            title: "ZIP processed successfully", 
            description: `Extracted ${result.urls.length} images from ZIP file`
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'ZIP upload failed');
      }
    } catch (error) {
      console.error('ZIP upload error:', error);
      toast({ 
        title: "ZIP upload failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };


  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{property ? "Edit Property" : "Add New Property"}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Modern Family Estate"
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
              rows={4}
              required
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="1234 Sunset Boulevard"
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Beverly Hills"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="province">Province *</Label>
              <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gauteng">Gauteng</SelectItem>
                  <SelectItem value="western-cape">Western Cape</SelectItem>
                  <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                  <SelectItem value="limpopo">Limpopo</SelectItem>
                  <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="north-west">North West</SelectItem>
                  <SelectItem value="northern-cape">Northern Cape</SelectItem>
                  <SelectItem value="free-state">Free State</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder="2196"
                required
              />
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="cluster_home">Cluster Home</SelectItem>
                  <SelectItem value="farm">Farm</SelectItem>
                  <SelectItem value="vacant_land">Vacant Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"].map(num => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="area">Area (sqm) *</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="260"
                required
              />
            </div>
            <div>
              <Label htmlFor="lotSize">Lot Size (sqm)</Label>
              <Input
                id="lotSize"
                value={formData.lotSize}
                onChange={(e) => handleInputChange("lotSize", e.target.value)}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange("yearBuilt", e.target.value)}
                placeholder="2019"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="parking">Parking</Label>
              <Input
                id="parking"
                value={formData.parking}
                onChange={(e) => handleInputChange("parking", e.target.value)}
                placeholder="2-car garage"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
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
            <div>
              <Label htmlFor="agentId">Assigned Agent</Label>
              <Select value={formData.agentId} onValueChange={(value) => handleInputChange("agentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {Array.isArray(agents) && agents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                Add Feature
              </Button>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Images</Label>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image URL
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    className="flex items-center gap-2 w-full"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Images
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    className="flex items-center gap-2 w-full bg-purple-50 hover:bg-purple-100 border-purple-200"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Processing ZIP...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload ZIP Folder
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Upload Options:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Individual Images:</strong> Select multiple JPEG, PNG, GIF, or WebP files (max 10MB each)</li>
                  <li>• <strong>ZIP Folder:</strong> Upload a ZIP file containing multiple images (max 50MB)</li>
                  <li>• <strong>Image URLs:</strong> Add direct links to images hosted elsewhere</li>
                </ul>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100" height="100" fill="#f3f4f6"/>
                              <text x="50" y="50" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="12" fill="#9ca3af">
                                Image Error
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange("featured", checked as boolean)}
            />
            <Label htmlFor="featured">Featured Property</Label>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-primary hover:bg-purple-secondary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : property ? "Update Property" : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
