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
import { X, Upload, FileArchive, Plus, Trash2, Star, AlertTriangle } from "lucide-react";

interface BasicPropertyFormProps {
  open: boolean;
  onClose: () => void;
}

export default function BasicPropertyForm({ open, onClose }: BasicPropertyFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    additionalInfo: "",
    price: "",
    monthlyRates: "",
    monthlyLevies: "",
    address: "",
    suburb: "",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "",
    propertyType: "house",
    listingType: "sale",
    bedrooms: "3",
    bathrooms: "2",
    area: "",
    lotSize: "",
    lotSizeUnit: "sqm",
    parkingSpaces: "1",
    yearBuilt: "",
    status: "active",
    agentId: "9", // Default to Peter Spurgeon
    featured: false
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Property title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Property description is required";
    }
    // Price is now optional - will default to "POA" if empty
    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    }
    if (!formData.suburb.trim()) {
      newErrors.suburb = "Suburb is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Upload images and videos if any
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];
      
      if (selectedImages.length > 0 || selectedVideos.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });
        
        selectedVideos.forEach((file) => {
          formData.append('images', file); // Use same field name as backend expects
        });

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadResult = await uploadResponse.json();
          uploadedImages = uploadResult.imageUrls || uploadResult.filenames || [];
          uploadedVideos = uploadResult.videoUrls || [];
        } catch (error) {
          console.error('File upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      }

      // Format lot size with unit
      const formattedLotSize = data.lotSize.trim() 
        ? `${data.lotSize.trim()} ${data.lotSizeUnit}`
        : null;

      // Determine featured image from uploaded images
      const featuredImageUrl = featuredImageIndex !== null && uploadedImages[featuredImageIndex] 
        ? uploadedImages[featuredImageIndex] 
        : null;

      const propertyData = {
        title: data.title.trim(),
        description: data.description.trim(),
        additionalInfo: data.additionalInfo.trim(),
        price: data.price.trim(),
        monthlyRates: data.monthlyRates.trim(),
        monthlyLevies: data.monthlyLevies.trim(),
        address: data.address.trim(),
        suburb: data.suburb.trim(),
        city: data.city.trim(),
        province: data.province,
        postalCode: data.postalCode.trim(),
        propertyType: data.propertyType,
        listingType: data.listingType,
        bedrooms: parseInt(data.bedrooms) || 3,
        bathrooms: data.bathrooms,
        area: parseInt(data.area) || 0,
        lotSize: formattedLotSize,
        parkingSpaces: parseInt(data.parkingSpaces) || 0,
        yearBuilt: parseInt(data.yearBuilt) || null,
        status: data.status,
        agentId: data.agentId ? parseInt(data.agentId) : null,
        featured: data.featured,
        features: features,
        images: uploadedImages,
        featuredImage: featuredImageUrl,
        videos: uploadedVideos
      };

      return await apiRequest("POST", "/api/properties", propertyData);
    },
    onSuccess: () => {
      // Invalidate all properties queries regardless of filters
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return typeof query.queryKey[0] === 'string' && 
                 query.queryKey[0].startsWith('/api/properties');
        }
      });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      
      // Reset form and close
      setFormData({
        title: "",
        description: "",
        additionalInfo: "",
        price: "",
        monthlyRates: "",
        monthlyLevies: "",
        address: "",
        suburb: "",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "",
        propertyType: "house",
        listingType: "sale",
        bedrooms: "3",
        bathrooms: "2",
        area: "",
        lotSize: "",
        lotSizeUnit: "sqm",
        parkingSpaces: "1",
        yearBuilt: "",
        status: "active",
        agentId: "",
        featured: false
      });
      setFeatures([]);
      setSelectedImages([]);
      setSelectedVideos([]);
      setFeaturedImageIndex(null);
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
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields highlighted in red",
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    setSelectedVideos(prev => [...prev, ...videoFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Update featured image index if necessary
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(null);
    } else if (featuredImageIndex !== null && featuredImageIndex > index) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
                  Property Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Modern Family Home"
                  className={errors.title ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="listingType">Listing Type</Label>
                <Select value={formData.listingType} onValueChange={(value) => handleChange("listingType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Property Status</Label>
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

            <div>
              <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the property in detail..."
                rows={4}
                className={errors.description ? "border-red-500 focus:border-red-500" : ""}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
                placeholder="Any additional details, special features, or notes about the property..."
                rows={3}
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">
                  Sale Price (ZAR)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="Leave empty for POA (Price on Application)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to display "POA" (Price on Application)
                </p>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
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
                <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>
                  Street Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <Label htmlFor="suburb" className={errors.suburb ? "text-red-500" : ""}>
                  Suburb *
                </Label>
                <Input
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  placeholder="Sandton"
                  className={errors.suburb ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
                {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>}
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
              {/* Only show bedrooms/bathrooms for residential properties */}
              {!["commercial", "land"].includes(formData.propertyType) && (
                <>
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
                </>
              )}
              <div>
                <Label htmlFor="area">Floor Area (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="lotSize">
                  Lot Size {formData.propertyType === "land" ? "(acres or m²)" : "(m²)"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="lotSize"
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => handleChange("lotSize", e.target.value)}
                    placeholder="500"
                    className="flex-1"
                  />
                  {formData.propertyType === "land" && (
                    <Select value={formData.lotSizeUnit} onValueChange={(value) => handleChange("lotSizeUnit", value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">m²</SelectItem>
                        <SelectItem value="acres">acres</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
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
                  <SelectItem value="none">No Agent Assigned</SelectItem>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedImages.length} image(s) selected
                    </p>
                    {featuredImageIndex !== null && (
                      <p className="text-sm text-blue-600 font-medium">
                        Image {featuredImageIndex + 1} set as featured
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className={`relative rounded-lg border-2 transition-all ${
                        featuredImageIndex === index 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs p-2 text-center">
                          {file.name}
                        </div>
                        
                        {/* Featured Image Badge */}
                        {featuredImageIndex === index && (
                          <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 rounded-full p-0 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => setFeaturedImageIndex(index)}
                            title="Set as Featured Image"
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                            title="Remove Image"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedImages.length > 0 && featuredImageIndex === null && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Please select a featured image by clicking the star icon on one of your uploaded images.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {isUploading && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Uploading images...</div>
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Videos</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select Videos
                </Button>
              </div>
              
              <input
                ref={videoInputRef}
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              
              {selectedVideos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedVideos.length} video(s) selected
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedVideos.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-xs p-2">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeVideo(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
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