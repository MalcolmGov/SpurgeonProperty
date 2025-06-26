import { useState } from "react";
import SocialAdGenerator from "@/components/admin/SocialAdGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Zap, Target, TrendingUp } from "lucide-react";

export default function AdminSocialAds() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Social Media Ads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate professional social media advertisements for your property listings
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Multi-Platform
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  4 Platforms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  AI-Powered
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  GPT-4 Vision
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Brand Consistent
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Spurgeon Colors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Marketing Copy
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Auto-Generated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">1</span>
              </div>
              <h4 className="font-semibold mb-2">Select Property</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose any property from your listings
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">2</span>
              </div>
              <h4 className="font-semibold mb-2">Choose Platform</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select Facebook, Instagram, LinkedIn, or Twitter
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h4 className="font-semibold mb-2">AI Generation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI creates branded image and compelling copy
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <h4 className="font-semibold mb-2">Download & Share</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download images and copy text to post
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Platforms & Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded mx-auto mb-2 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h5 className="font-semibold">Facebook</h5>
              <div className="space-y-1 mt-2">
                <Badge variant="outline" className="text-xs">Feed (4:5)</Badge>
                <Badge variant="outline" className="text-xs">Banner (16:9)</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded mx-auto mb-2 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <h5 className="font-semibold">Instagram</h5>
              <div className="space-y-1 mt-2">
                <Badge variant="outline" className="text-xs">Square (1:1)</Badge>
                <Badge variant="outline" className="text-xs">Story (9:16)</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded mx-auto mb-2 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h5 className="font-semibold">LinkedIn</h5>
              <div className="space-y-1 mt-2">
                <Badge variant="outline" className="text-xs">Banner (16:9)</Badge>
                <Badge variant="outline" className="text-xs">Square (1:1)</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded mx-auto mb-2 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <h5 className="font-semibold">Twitter</h5>
              <div className="space-y-1 mt-2">
                <Badge variant="outline" className="text-xs">Banner (16:9)</Badge>
                <Badge variant="outline" className="text-xs">Square (1:1)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Generator Component */}
      <SocialAdGenerator propertyId={0} />
    </div>
  );
}