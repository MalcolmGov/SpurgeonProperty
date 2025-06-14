import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MinimalPropertyFormProps {
  open: boolean;
  onClose: () => void;
}

export default function MinimalPropertyForm({ open, onClose }: MinimalPropertyFormProps) {
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
    agentId: ""
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch agents for selection
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/admin/agents"],
    enabled: open,
  });

  // Common property features
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
        status: "active",
        agentId: ""
      });
      setFeatures([]);
      setSelectedImages([]);
      setUploadedImages([]);
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
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success && result.urls) {
        // Store the uploaded image URLs
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Property</h2>
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
                <label className="block text-sm font-medium mb-1">Property Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Modern Family Home"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
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
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the property in detail..."
                rows={3}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sale Price (ZAR) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="850000"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
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
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Suburb *</label>
                <input
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  placeholder="Sandton"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
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
                <label className="block text-sm font-medium mb-1">Lot Size (m²)</label>
                <input
                  type="number"
                  value={formData.lotSize}
                  onChange={(e) => handleChange("lotSize", e.target.value)}
                  placeholder="500"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
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
              
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImages.length} image(s) selected
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs p-2 text-center">
                          {file.name}
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
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uploading images...</div>
                </div>
              )}
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
              {mutation.isPending ? "Creating..." : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}