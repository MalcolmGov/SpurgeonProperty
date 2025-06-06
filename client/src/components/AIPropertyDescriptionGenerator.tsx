import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Wand2, MessageSquare, Copy, RefreshCw } from "lucide-react";
import type { Property } from "@shared/schema";

interface AIPropertyDescriptionGeneratorProps {
  property?: Property;
  onDescriptionGenerated?: (description: string) => void;
  onDescriptionEnhanced?: (description: string) => void;
}

interface GeneratedContent {
  description: string;
  highlights: string[];
  marketingTags: string[];
}

interface MarketingContent {
  socialMediaPost: string;
  emailSubject: string;
  tagline: string;
}

export default function AIPropertyDescriptionGenerator({ 
  property, 
  onDescriptionGenerated,
  onDescriptionEnhanced 
}: AIPropertyDescriptionGeneratorProps) {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [marketingContent, setMarketingContent] = useState<MarketingContent | null>(null);
  const [enhancedDescription, setEnhancedDescription] = useState<string>("");
  const [existingDescription, setExistingDescription] = useState<string>(property?.description || "");
  const { toast } = useToast();

  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property data is required");
      
      const propertyDetails = {
        title: property.title,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: parseInt(property.bathrooms),
        area: property.area,
        address: property.address,
        suburb: property.suburb,
        city: property.city,
        province: property.province,
        price: property.price,
        lotSize: property.lotSize || undefined,
        yearBuilt: property.yearBuilt || undefined,
        parkingSpaces: property.parkingSpaces || undefined,
        features: property.features || []
      };

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      return response.json();
    },
    onSuccess: (data: GeneratedContent) => {
      setGeneratedContent(data);
      onDescriptionGenerated?.(data.description);
      toast({
        title: "Description Generated",
        description: "AI has created a compelling property description.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enhanceDescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!property || !existingDescription.trim()) {
        throw new Error("Property data and existing description are required");
      }

      const propertyDetails = {
        propertyType: property.propertyType,
        address: property.address,
        suburb: property.suburb,
        city: property.city,
        province: property.province,
        bedrooms: property.bedrooms,
        bathrooms: parseInt(property.bathrooms),
        area: property.area,
        price: property.price,
      };

      const response = await fetch("/api/ai/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: existingDescription,
          propertyDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance description");
      }

      return response.json();
    },
    onSuccess: (data: { description: string }) => {
      setEnhancedDescription(data.description);
      onDescriptionEnhanced?.(data.description);
      toast({
        title: "Description Enhanced",
        description: "Your description has been improved with AI.",
      });
    },
    onError: () => {
      toast({
        title: "Enhancement Failed",
        description: "Unable to enhance description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateMarketingMutation = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property data is required");

      const propertyDetails = {
        propertyType: property.propertyType,
        suburb: property.suburb,
        city: property.city,
        province: property.province,
        bedrooms: property.bedrooms,
        bathrooms: parseInt(property.bathrooms),
        price: property.price,
      };

      const response = await fetch("/api/ai/generate-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to generate marketing content");
      }

      return response.json();
    },
    onSuccess: (data: MarketingContent) => {
      setMarketingContent(data);
      toast({
        title: "Marketing Content Generated",
        description: "AI has created marketing materials for your property.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate marketing content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  if (!property) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Select a property to generate descriptions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Property Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate New</TabsTrigger>
              <TabsTrigger value="enhance">Enhance Existing</TabsTrigger>
              <TabsTrigger value="marketing">Marketing Content</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Generate a compelling property description based on the property details.
              </div>
              
              <Button
                onClick={() => generateDescriptionMutation.mutate()}
                disabled={generateDescriptionMutation.isPending}
                className="w-full"
              >
                {generateDescriptionMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Description...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate AI Description
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Generated Description</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent.description)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent.description}
                      readOnly
                      className="min-h-32"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Marketing Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.marketingTags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="enhance" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Enhance an existing property description with AI-powered improvements.
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Description
                </label>
                <Textarea
                  value={existingDescription}
                  onChange={(e) => setExistingDescription(e.target.value)}
                  placeholder="Enter the existing property description to enhance..."
                  className="min-h-24"
                />
              </div>

              <Button
                onClick={() => enhanceDescriptionMutation.mutate()}
                disabled={enhanceDescriptionMutation.isPending || !existingDescription.trim()}
                className="w-full"
              >
                {enhanceDescriptionMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing Description...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>

              {enhancedDescription && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Enhanced Description</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(enhancedDescription)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={enhancedDescription}
                    readOnly
                    className="min-h-32"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Generate marketing content including social media posts, email subjects, and taglines.
              </div>
              
              <Button
                onClick={() => generateMarketingMutation.mutate()}
                disabled={generateMarketingMutation.isPending}
                className="w-full"
              >
                {generateMarketingMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Marketing Content...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate Marketing Content
                  </>
                )}
              </Button>

              {marketingContent && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Social Media Post</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(marketingContent.socialMediaPost)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={marketingContent.socialMediaPost}
                      readOnly
                      className="min-h-20"
                    />
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Email Subject Line</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(marketingContent.emailSubject)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      {marketingContent.emailSubject}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Property Tagline</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(marketingContent.tagline)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md font-medium">
                      {marketingContent.tagline}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}