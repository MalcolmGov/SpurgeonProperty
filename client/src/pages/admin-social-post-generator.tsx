import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, Share2, Loader2, Home, MapPin, BedDouble, Bath, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import AdminSidebar from "@/components/admin/sidebar";

interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  propertyType: string;
  listingType: string;
  address: string;
  suburb: string;
  city: string;
  bedrooms: number;
  bathrooms: string;
  area: number;
  images: string[];
  featuredImage?: string;
  features?: string[];
  status: string;
}

const CONTACT_DETAILS = {
  agent: "Peter Spurgeon",
  phone: "084 208 9307",
  email: "peter@spurgeonproperty.com",
  website: "spurgeonproperty.com"
};

export default function AdminSocialPostGenerator() {
  const { toast } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [generatedPost, setGeneratedPost] = useState<{
    caption: string;
    cta: string;
    hashtags: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const pricePillRef = useRef<HTMLDivElement>(null);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", "social-generator"],
    queryFn: () =>
      fetch("/api/properties?limit=100", { credentials: "include" }).then((res) =>
        res.json()
      ),
  });

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const formatPrice = (price: string) => {
    if (!price || price === "POA" || price === "0") return "Price on Application";
    const numPrice = parseInt(price.replace(/[^0-9]/g, ""));
    if (numPrice >= 1000000) {
      return `R ${(numPrice / 1000000).toFixed(2).replace(".", ",")} million`;
    }
    return `R ${numPrice.toLocaleString("en-ZA")}`;
  };

  const formatPriceShort = (price: string) => {
    if (!price || price === "POA" || price === "0") return "POA";
    const numPrice = parseInt(price.replace(/[^0-9]/g, ""));
    if (numPrice >= 1000000) {
      return `R${(numPrice / 1000000).toFixed(2).replace(".", ",")}m`;
    }
    return `R${(numPrice / 1000).toFixed(0)}k`;
  };

  const getImageSrc = (property: Property) => {
    const imageToUse = property.featuredImage || property.images?.[0];
    if (!imageToUse) return "/api/placeholder/800/600";
    if (imageToUse.startsWith("http") || imageToUse.startsWith("/uploads")) {
      return imageToUse;
    }
    return `/uploads/${imageToUse}`;
  };

  const getLifestyleHook = (property: Property) => {
    const hooks = [];
    if (property.features?.some(f => f.toLowerCase().includes("pool"))) hooks.push("With Swimming Pool");
    if (property.features?.some(f => f.toLowerCase().includes("garden"))) hooks.push("Beautiful Garden Home");
    if (property.features?.some(f => f.toLowerCase().includes("sea") || f.toLowerCase().includes("beach") || f.toLowerCase().includes("ocean"))) hooks.push("Coastal Living at Its Best");
    if (property.bedrooms >= 4) hooks.push("Spacious Family Home");
    if (property.suburb.toLowerCase().includes("beach") || property.city.toLowerCase().includes("coast")) hooks.push("Perfect Coastal Living");
    return hooks.length > 0 ? hooks[0] : `Exceptional Value in ${property.suburb}`;
  };

  const generateSocialPost = (property: Property) => {
    const features = property.features?.slice(0, 4).join(" • ") || "";
    const lifestyleHook = getLifestyleHook(property);
    return {
      caption: `🏡 ${property.listingType === "sale" ? "FOR SALE" : "FOR RENT"} | ${property.suburb}, ${property.city}

✨ ${lifestyleHook}

${property.title}

${property.description.slice(0, 180)}${property.description.length > 180 ? "..." : ""}

🛏️ ${property.bedrooms} Bedrooms | 🚿 ${property.bathrooms} Bathrooms
${property.area > 0 ? `📐 ${property.area}m² ` : ""}${features ? `\n🌟 ${features}` : ""}

💰 ${formatPrice(property.price)}

—
Contact ${CONTACT_DETAILS.agent} to View

👤 ${CONTACT_DETAILS.agent}
📞 ${CONTACT_DETAILS.phone}
📧 ${CONTACT_DETAILS.email}
🌐 ${CONTACT_DETAILS.website}`,
      cta: `Contact ${CONTACT_DETAILS.agent} to View 📞`,
      hashtags: [
        "#SpurgeonProperty",
        "#SouthAfricanProperty",
        "#DreamHome",
        `#${property.city.replace(/\s/g, "")}`,
        `#${property.suburb.replace(/\s/g, "")}`,
        "#PropertyForSale",
        "#RealEstate",
        "#LuxuryLiving"
      ],
    };
  };

  const generatePost = () => {
    if (!selectedProperty) {
      toast({
        title: "No property selected",
        description: "Please select a property first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const post = generateSocialPost(selectedProperty);
      setGeneratedPost(post);
      setIsGenerating(false);
      toast({
        title: "Post generated!",
        description: `Social media post ready for ${selectedProperty.title}`,
      });
    }, 800);
  };

  const copyToClipboard = () => {
    if (!generatedPost) return;
    const fullText = generatedPost.hashtags
      ? `${generatedPost.caption}\n\n${generatedPost.hashtags.join(" ")}`
      : generatedPost.caption;
    navigator.clipboard.writeText(fullText);
    toast({ title: "Copied to clipboard!", description: "Caption and hashtags copied" });
  };

  const downloadImage = async () => {
    if (!previewRef.current || !selectedProperty) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000
      });
      
      const link = document.createElement("a");
      link.download = `${selectedProperty.title.replace(/[^a-zA-Z0-9]/g, "_")}_social_post.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({ title: "Image downloaded!", description: "Social media image saved" });
    } catch (error) {
      toast({ title: "Download failed", description: "Could not generate image", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 pt-20 lg:pt-6 space-y-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Social Property Post Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create professional social media posts for your property listings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Selection */}
          <div className="space-y-6">
            {/* Property Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-purple-600" />
                  Select Property
                </CardTitle>
                <CardDescription>Choose a property to create a post for</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <Select
                    value={selectedPropertyId?.toString() || ""}
                    onValueChange={(val) => {
                      setSelectedPropertyId(parseInt(val));
                      setGeneratedPost(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[250px]">{property.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {property.suburb}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedProperty && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex gap-4">
                      <img
                        src={getImageSrc(selectedProperty)}
                        alt={selectedProperty.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{selectedProperty.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {selectedProperty.suburb}, {selectedProperty.city}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" /> {selectedProperty.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" /> {selectedProperty.bathrooms}
                          </span>
                        </div>
                        <p className="text-purple-600 font-bold mt-2">
                          {formatPriceShort(selectedProperty.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-orange-500" />
                  Generate Social Post
                </CardTitle>
                <CardDescription>Create a post for any social media platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2 mb-6">
                  <p>✅ Professional property description</p>
                  <p>✅ Key details and features</p>
                  <p>✅ Contact information included</p>
                  <p>✅ Relevant hashtags for reach</p>
                </div>

                <Button
                  onClick={generatePost}
                  disabled={!selectedProperty || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Generated Post */}
          <div className="space-y-6">
            {generatedPost && selectedProperty ? (
              <>
                {/* Post Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-purple-600" />
                        Social Media Post
                      </span>
                      <Badge className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
                        Ready
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Visual Preview - Enhanced Premium Design */}
                    <div 
                      ref={previewRef}
                      className="relative rounded-2xl overflow-hidden"
                      style={{ 
                        background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #F97316 100%)",
                        padding: "3px"
                      }}
                    >
                      <div className="bg-white rounded-xl overflow-hidden">
                        {/* Hero Image Section */}
                        <div className="relative">
                          <img
                            src={getImageSrc(selectedProperty)}
                            alt={selectedProperty.title}
                            className="w-full h-56 md:h-72 object-cover"
                            style={{ filter: "contrast(1.02) brightness(1.02)" }}
                          />
                          {/* Subtle gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          
                          {/* For Sale Badge - Larger & Bolder */}
                          <div className="absolute top-5 left-5">
                            <div className="bg-orange-500 text-white text-sm font-bold px-5 py-2 rounded-lg shadow-lg">
                              {selectedProperty.listingType === "sale" ? "For Sale" : "For Rent"}
                            </div>
                          </div>
                          
                          {/* Logo - Visible but not overpowering */}
                          <div className="absolute top-5 right-5">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                              <img src="/spurgeon-logo.png" alt="Spurgeon Property" className="h-6" />
                            </div>
                          </div>
                          
                        </div>
                        
                        {/* Content Section - Clear Visual Flow */}
                        <div className="p-6 space-y-4">
                          {/* PRICE - Prominent and reliable */}
                          <div 
                            ref={pricePillRef}
                            className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg"
                          >
                            <span className="font-bold text-2xl">
                              {formatPriceShort(selectedProperty.price)}
                            </span>
                          </div>
                          
                          {/* Title - Strong weight */}
                          <div>
                            <h3 className="font-bold text-xl md:text-2xl text-gray-900 leading-tight">
                              {selectedProperty.title}
                            </h3>
                            {/* Location - Softer secondary */}
                            <p className="text-gray-500 text-base flex items-center gap-2 mt-2">
                              <MapPin className="h-4 w-4 text-purple-500" />
                              {selectedProperty.suburb}, {selectedProperty.city}
                            </p>
                          </div>
                          
                          {/* Key Specs - Larger badges with better spacing */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="border-2 border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-full text-base font-semibold flex items-center gap-2">
                              <BedDouble className="h-5 w-5 text-purple-600" />
                              {selectedProperty.bedrooms} Beds
                            </span>
                            <span className="border-2 border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-full text-base font-semibold flex items-center gap-2">
                              <Bath className="h-5 w-5 text-purple-600" />
                              {selectedProperty.bathrooms} Baths
                            </span>
                            {selectedProperty.area > 0 && (
                              <span className="border-2 border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-full text-base font-semibold">
                                {selectedProperty.area}m²
                              </span>
                            )}
                          </div>
                          
                          {/* CTA Line */}
                          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg px-4 py-2">
                            <p className="text-purple-700 font-semibold text-sm">
                              Contact {CONTACT_DETAILS.agent} to View
                            </p>
                          </div>
                          
                          {/* Contact Block - Visually Grouped */}
                          <div className="border-t border-gray-100 pt-4">
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                              <p className="text-gray-800 font-semibold text-sm flex items-center gap-2">
                                <span className="w-5 text-center">👤</span>
                                {CONTACT_DETAILS.agent}
                              </p>
                              <p className="text-gray-600 text-sm flex items-center gap-2">
                                <span className="w-5 text-center">📞</span>
                                {CONTACT_DETAILS.phone}
                              </p>
                              <p className="text-gray-600 text-sm flex items-center gap-2">
                                <span className="w-5 text-center">📧</span>
                                {CONTACT_DETAILS.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="text-sm font-medium flex items-center justify-between mb-2">
                        <span>Caption</span>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </label>
                      <Textarea
                        value={generatedPost.caption}
                        readOnly
                        className="min-h-[200px] text-sm"
                      />
                    </div>

                    {/* Hashtags (for Instagram/TikTok) */}
                    {generatedPost.hashtags && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Hashtags</label>
                        <div className="flex flex-wrap gap-1">
                          {generatedPost.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Call to Action</label>
                      <div className="bg-gradient-to-r from-purple-100 to-orange-100 p-3 rounded-lg">
                        <p className="font-semibold text-purple-700">{generatedPost.cta}</p>
                      </div>
                    </div>

                    {/* Contact Block */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Contact Block</h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{CONTACT_DETAILS.agent}</p>
                        <p>📞 {CONTACT_DETAILS.phone}</p>
                        <p>📧 {CONTACT_DETAILS.email}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500"
                        onClick={downloadImage}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download Image
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Layout Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-purple-600" />
                      Visual Layout Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {generatedPost.visualLayout}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Post Generated Yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Select a property and platform, then click "Generate Post" to create your social media content
                  </p>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
