import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminSocialAdsSimple() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleDemo = () => {
    toast({
      title: "Demo Generated!",
      description: "This shows how your social media ads will look."
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
    </div>
  );
}