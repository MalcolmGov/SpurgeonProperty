import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MinimalPropertyFormProps {
  open: boolean;
  onClose: () => void;
  property?: any; // Property to edit (undefined for new property)
}

export default function MinimalPropertyForm({ open, onClose, property }: MinimalPropertyFormProps) {
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

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch agents for selection
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/admin/agents"],
    enabled: open,
  });

  // Populate form when editing existing property
  useEffect(() => {
    if (property && open) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        additionalInfo: property.additionalInfo || "",
        price: property.price || "",
        monthlyRates: property.monthlyRates || "",
        monthlyLevies: property.monthlyLevies || "",
        address: property.address || "",
        suburb: property.suburb || "",
        city: property.city || "Johannesburg",
        province: property.province || "Gauteng",
        postalCode: property.postalCode || "",
        propertyType: property.propertyType || "house",
        bedrooms: property.bedrooms?.toString() || "3",
        bathrooms: property.bathrooms?.toString() || "2",
        area: property.area?.toString() || "",
        lotSize: property.lotSize?.toString() || "",
        lotSizeUnit: "sqm",
        parkingSpaces: property.parkingSpaces?.toString() || "1",
        yearBuilt: property.yearBuilt?.toString() || "",
        status: property.status || "active",
        agentId: property.agentId?.toString() || "",
        featured: property.featured || false
      });
      
      // Set existing features
      if (property.features && Array.isArray(property.features)) {
        setFeatures(property.features);
      }
      
      // Set existing images
      if (property.images && Array.isArray(property.images)) {
        setUploadedImages(property.images);
      }
      
      // Set existing videos
      if (property.videos && Array.isArray(property.videos)) {
        setUploadedVideos(property.videos);
      }
    } else if (open && !property) {
      // Reset form for new property
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
      setUploadedImages([]);
    }
  }, [property, open]);

  // Common property features
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
    if (!formData.price.trim()) {
      newErrors.price = "Sale price is required";
    }
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
      let regularUploadedImages: string[] = [];
      let uploadedVideoFiles: string[] = [];
      
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
          regularUploadedImages = uploadResult.imageUrls || uploadResult.urls || [];
          uploadedVideoFiles = uploadResult.videoUrls || [];
        } catch (error) {
          console.error('File upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      }

      // Combine all images: ZIP-extracted images + regular uploaded images
      const allImages = [...uploadedImages, ...regularUploadedImages];
      
      // Combine all videos: existing videos + newly uploaded videos
      const allVideos = [...uploadedVideos, ...uploadedVideoFiles];

      // Format lot size with unit
      const formattedLotSize = data.lotSize.trim() 
        ? `${data.lotSize.trim()} ${data.lotSizeUnit}`
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
        images: allImages,
        videos: allVideos
      };

      // Use PUT for updates, POST for new properties
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
      
      // Reset form
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
      setUploadedImages([]);
      setUploadedVideos([]);
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    setSelectedVideos(prev => [...prev, ...videoFiles]);
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
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success && result.urls) {
        // Store the uploaded image URLs
        console.log('ZIP extracted URLs:', result.urls);
        setUploadedImages(prev => [...prev, ...result.urls]);
        
        toast({
          title: "Success",
          description: `Extracted ${result.urls.length} images from ZIP file`,
        });
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

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{property ? "Edit Property" : "Add New Property"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${errors.title ? "text-red-500" : ""}`}>
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Modern Family Home"
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.title ? "border-red-500 focus:border-red-500" : ""}`}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="villa">Villa</option>
                  <option value="estate">Estate</option>
                  <option value="farm">Farm</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${errors.description ? "text-red-500" : ""}`}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the property in detail..."
                rows={3}
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Additional Information</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
                placeholder="Any additional details, special features, or notes about the property..."
                rows={3}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${errors.price ? "text-red-500" : ""}`}>
                  Sale Price (ZAR) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="850000"
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.price ? "border-red-500 focus:border-red-500" : ""}`}
                  required
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rates (ZAR)</label>
                <input
                  type="number"
                  value={formData.monthlyRates}
                  onChange={(e) => handleChange("monthlyRates", e.target.value)}
                  placeholder="1200"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Levies (ZAR)</label>
                <input
                  type="number"
                  value={formData.monthlyLevies}
                  onChange={(e) => handleChange("monthlyLevies", e.target.value)}
                  placeholder="800"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${errors.address ? "text-red-500" : ""}`}>
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.address ? "border-red-500 focus:border-red-500" : ""}`}
                  required
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${errors.suburb ? "text-red-500" : ""}`}>
                  Suburb *
                </label>
                <input
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  placeholder="Sandton"
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.suburb ? "border-red-500 focus:border-red-500" : ""}`}
                  required
                />
                {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Johannesburg"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="2196"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms</label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2</option>
                  <option value="2.5">2.5</option>
                  <option value="3">3</option>
                  <option value="3.5">3.5</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Floor Area (m²)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="150"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lot Size {formData.propertyType === "land" ? "" : "(m²)"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => handleChange("lotSize", e.target.value)}
                    placeholder={formData.propertyType === "land" ? "2.5" : "500"}
                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  {formData.propertyType === "land" && (
                    <select
                      value={formData.lotSizeUnit}
                      onChange={(e) => handleChange("lotSizeUnit", e.target.value)}
                      className="w-20 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="sqm">m²</option>
                      <option value="acres">acres</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parking Spaces</label>
                <select
                  value={formData.parkingSpaces}
                  onChange={(e) => handleChange("parkingSpaces", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="0">None</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year Built</label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => handleChange("yearBuilt", e.target.value)}
                  placeholder="2010"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agent Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agent Assignment</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Agent</label>
              <select
                value={formData.agentId}
                onChange={(e) => handleChange("agentId", e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No Agent Assigned</option>
                {Array.isArray(agents) && agents.map((agent: any) => (
                  <option key={agent.id} value={agent.id.toString()}>
                    {agent.name} - {agent.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Status</h3>
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="sr-only"
                  />
                  <div 
                    onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                    className={`w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-colors ${
                      formData.featured 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {formData.featured && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <label 
                  htmlFor="featured" 
                  className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                >
                  Mark as Featured Property
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                Featured properties will be highlighted and appear at the top of search results
              </p>
            </div>
          </div>

          {/* Property Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Features</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addFeature(feature);
                        } else {
                          removeFeature(feature);
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={feature} className="text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add custom feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={addCustomFeature}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Add
                </button>
              </div>
              
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  📁 Select Images
                </button>
                <button
                  type="button"
                  onClick={() => zipInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  📦 Upload ZIP
                </button>
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
              
              {(selectedImages.length > 0 || uploadedImages.length > 0) && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImages.length} image(s) selected, {uploadedImages.length} uploaded from ZIP
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={`file-${index}`} className="relative">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs p-2 text-center">${file.name}</div>`;
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {uploadedImages.map((url, index) => {
                      console.log(`Rendering ZIP image ${index + 1}:`, url);
                      return (
                        <div key={`zip-${index}`} className="relative">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <img 
                              src={url} 
                              alt={`ZIP Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log(`ZIP image ${index + 1} loaded successfully:`, url)}
                              onError={(e) => {
                                console.error(`ZIP image ${index + 1} failed to load:`, url);
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs">ZIP Image ${index + 1}</div>`;
                                }
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</div>
                </div>
              )}
            </div>

            {/* Video Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Property Videos</label>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select MP4, AVI, MOV, WMV, FLV, WebM, or MKV files (max 100MB each)
                  </p>
                </div>

                {/* Selected Videos Preview */}
                {selectedVideos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Videos ({selectedVideos.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVideos.map((video, index) => (
                        <div key={index} className="relative border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="space-y-2">
                            <div className="font-medium text-sm truncate">{video.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Size: {(video.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                            <video
                              src={URL.createObjectURL(video)}
                              className="w-full h-32 object-cover rounded"
                              controls
                              preload="metadata"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Videos (for edit mode) */}
                {uploadedVideos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Videos ({uploadedVideos.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedVideos.map((videoUrl, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden">
                          <video
                            src={videoUrl}
                            className="w-full h-32 object-cover"
                            controls
                            preload="metadata"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedVideos(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
{mutation.isPending ? (property ? "Updating..." : "Creating...") : (property ? "Update Property" : "Create Property")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}