import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoAd {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  targetAudience: string;
}

export default function AdminSocialAdsSimple() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [demoAd, setDemoAd] = useState<DemoAd | null>(null);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleDemo = () => {
    const demo: DemoAd = {
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1024&h=1024&fit=crop',
      caption: `🏡 Luxury apartment in Table View, Blouberg\n\n✨ 2 bed, 1 bath\n💰 R2,950,000\n🌟 Swimming Pool, Balcony, Security Complex\n\nContact Spurgeon Property today!`,
      hashtags: ['#Property', '#RealEstate', '#SouthAfrica', '#Blouberg', '#TableView', '#ApartmentForSale', '#LuxuryLiving', '#SwimmingPool', '#SecurityComplex', '#SpurgeonProperty'],
      callToAction: 'View Property',
      targetAudience: 'Apartment buyers in Blouberg and surrounding areas'
    };
    
    setDemoAd(demo);
    toast({
      title: "Demo Generated!",
      description: "This shows how your social media ads will look."
    });
  };

  const handleCopyCaption = () => {
    if (demoAd) {
      const fullText = `${demoAd.caption}\n\n${demoAd.hashtags.join(' ')}`;
      navigator.clipboard.writeText(fullText);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const handleDownloadImage = () => {
    toast({ 
      title: "Download feature", 
      description: "In production, this will download the AI-generated property image."
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Social Ads...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Social Media Ad Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create professional social media advertisements for your properties
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Property Ads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Select a property and platform to generate professional social media advertisements.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> OpenAI API quota exceeded. Add credits to your OpenAI account to generate AI-powered ads.
            </p>
          </div>
          
          <Button 
            onClick={handleDemo}
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            View Demo Ad
          </Button>
        </CardContent>
      </Card>

      {/* Demo Ad Display */}
      {demoAd && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Demo Social Media Ad
              <Badge variant="outline" className="ml-auto">Facebook</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generated Image */}
            <div className="relative group">
              <img 
                src={demoAd.imageUrl} 
                alt="Demo property ad"
                className="w-full h-64 object-cover rounded-lg border-2 border-purple-200"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadImage}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Ad Content */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Caption</label>
                <Textarea 
                  value={demoAd.caption}
                  readOnly
                  className="mt-1 text-sm"
                  rows={5}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Hashtags</label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {demoAd.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Call to Action</label>
                  <p className="text-purple-600 font-medium">{demoAd.callToAction}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Target Audience</label>
                  <p className="text-gray-700">{demoAd.targetAudience}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCaption}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadImage}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
              <p className="text-blue-800">
                <strong>Demo Mode:</strong> This shows the format and style of your social media ads. 
                With OpenAI credits, you'll get AI-generated custom images with Spurgeon Property branding 
                and personalized marketing copy for each property.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}