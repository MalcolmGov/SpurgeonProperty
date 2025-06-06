import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, 
  GraduationCap, 
  ShoppingCart, 
  Hospital, 
  Car, 
  TrendingUp,
  Shield,
  Star,
  Clock,
  Banknote,
  Home,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

interface NeighborhoodAnalyticsProps {
  property: PropertyWithAgent;
}

interface SchoolData {
  name: string;
  type: "Primary" | "Secondary" | "Combined";
  rating: number;
  distance: number;
  fees?: string;
}

interface AmenityData {
  category: string;
  name: string;
  distance: number;
  rating?: number;
  type: string;
}

interface MarketTrend {
  period: string;
  averagePrice: number;
  priceChange: number;
  salesVolume: number;
  daysOnMarket: number;
}

interface SafetyRating {
  overall: number;
  category: "Excellent" | "Good" | "Average" | "Below Average";
  factors: string[];
}

// Sample data structure - will be replaced with API calls
const getSampleSchools = (suburb: string): SchoolData[] => [
  {
    name: `${suburb} Primary School`,
    type: "Primary",
    rating: 4.2,
    distance: 0.8,
    fees: "Public School"
  },
  {
    name: `${suburb} High School`,
    type: "Secondary", 
    rating: 4.0,
    distance: 1.2,
    fees: "Public School"
  },
  {
    name: "St. Mary's College",
    type: "Combined",
    rating: 4.6,
    distance: 2.1,
    fees: "R45,000/year"
  }
];

const getSampleAmenities = (suburb: string): AmenityData[] => [
  { category: "Healthcare", name: `${suburb} Medical Centre`, distance: 1.1, rating: 4.3, type: "Medical Centre" },
  { category: "Healthcare", name: "Life Hospital", distance: 3.2, rating: 4.7, type: "Private Hospital" },
  { category: "Shopping", name: `${suburb} Mall`, distance: 2.0, rating: 4.1, type: "Shopping Centre" },
  { category: "Shopping", name: "Pick n Pay", distance: 0.6, rating: 4.0, type: "Supermarket" },
  { category: "Transport", name: "Gautrain Station", distance: 5.2, type: "Public Transport" },
  { category: "Recreation", name: `${suburb} Park`, distance: 0.9, rating: 4.2, type: "Public Park" },
  { category: "Recreation", name: "Virgin Active Gym", distance: 1.8, rating: 4.4, type: "Fitness Centre" }
];

const getSampleMarketTrends = (): MarketTrend[] => [
  {
    period: "Last 3 months",
    averagePrice: 2650000,
    priceChange: 3.2,
    salesVolume: 47,
    daysOnMarket: 68
  },
  {
    period: "Last 6 months", 
    averagePrice: 2580000,
    priceChange: 5.8,
    salesVolume: 89,
    daysOnMarket: 72
  },
  {
    period: "Last 12 months",
    averagePrice: 2420000,
    priceChange: 8.1,
    salesVolume: 156,
    daysOnMarket: 78
  }
];

const getSafetyRating = (suburb: string): SafetyRating => {
  // This will be replaced with real crime data API
  const ratings: Record<string, SafetyRating> = {
    "Sandton": {
      overall: 78,
      category: "Good",
      factors: ["Active security patrols", "CCTV coverage", "Low crime rate"]
    },
    "Cape Town CBD": {
      overall: 65,
      category: "Average", 
      factors: ["Business district security", "Mixed residential safety", "Public safety initiatives"]
    },
    "Camps Bay": {
      overall: 85,
      category: "Excellent",
      factors: ["Low crime rate", "Tourist police presence", "Affluent area security"]
    },
    "Umhlanga Rocks": {
      overall: 82,
      category: "Excellent",
      factors: ["Beachfront security", "Low crime rate", "Private security"]
    }
  };

  return ratings[suburb] || {
    overall: 70,
    category: "Good",
    factors: ["Standard suburban safety", "Community watch programs"]
  };
};

export default function NeighborhoodAnalytics({ property }: NeighborhoodAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Debug property coordinates
  console.log('Property coordinates:', {
    latitude: property.latitude,
    longitude: property.longitude,
    suburb: property.suburb,
    city: property.city
  });

  // Fetch real neighborhood data using Google Places API
  const { data: neighborhoodData, isLoading, error } = useQuery({
    queryKey: ['neighborhood-analytics', property.latitude, property.longitude, property.suburb, property.city],
    queryFn: async () => {
      console.log('Fetching neighborhood data for:', property.latitude, property.longitude);
      
      if (!property.latitude || !property.longitude) {
        throw new Error('Property coordinates not available');
      }
      
      const url = `/api/neighborhood-analytics?latitude=${property.latitude}&longitude=${property.longitude}&suburb=${property.suburb}&city=${property.city}`;
      console.log('API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch neighborhood data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Neighborhood data received:', data);
      return data;
    },
    enabled: !!(property.latitude && property.longitude),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const schools = neighborhoodData?.schools || [];
  const amenities = neighborhoodData?.amenities || [];
  const marketTrends = neighborhoodData?.marketTrends || [];
  const safetyRating = neighborhoodData?.safetyRating || getSafetyRating(property.suburb);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600"; 
    if (rating >= 3.5) return "text-orange-600";
    return "text-red-600";
  };

  const getSafetyColor = (category: string) => {
    switch (category) {
      case "Excellent": return "text-green-600";
      case "Good": return "text-blue-600";
      case "Average": return "text-yellow-600";
      default: return "text-red-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-primary" />
            Neighborhood Analytics - {property.suburb}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-primary mr-3" />
            <span className="text-slate-600 dark:text-slate-400">
              Loading neighborhood data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-primary" />
            Neighborhood Analytics - {property.suburb}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Unable to load neighborhood data
              </p>
              <p className="text-sm text-slate-500">
                Please check your connection or try again later
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-primary" />
          Neighborhood Analytics - {property.suburb}
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Real-time insights about schools, amenities, safety, and market trends from Google Places API
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="market">Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Safety Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Safety Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{safetyRating.overall}/100</span>
                      <Badge className={`${getSafetyColor(safetyRating.category)} bg-transparent border`}>
                        {safetyRating.category}
                      </Badge>
                    </div>
                    <Progress value={safetyRating.overall} className="h-2" />
                    <div className="space-y-1">
                      {safetyRating.factors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Area Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Top Schools Within 5km</span>
                      <span className="font-medium">{schools.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Healthcare Facilities</span>
                      <span className="font-medium">{amenities.filter(a => a.category === "Healthcare").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Shopping Centers</span>
                      <span className="font-medium">{amenities.filter(a => a.category === "Shopping").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Average Market Price</span>
                      <span className="font-medium">R{marketTrends[0]?.averagePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Location Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Location Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {property.suburb} is a {safetyRating.category.toLowerCase()} area in {property.city}, {property.province}. 
                  The neighborhood offers {schools.length} schools within 5km, including highly-rated options. 
                  Residents have access to comprehensive amenities including healthcare, shopping, and recreational facilities. 
                  The local property market has shown a {marketTrends[0]?.priceChange}% increase over the last 3 months.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-4">
            <div className="grid gap-4">
              {schools.map((school, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                          <h4 className="font-semibold">{school.name}</h4>
                          <Badge variant="outline">{school.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {school.distance}km away
                          </span>
                          <span className="flex items-center">
                            <Banknote className="w-3 h-3 mr-1" />
                            {school.fees}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(school.rating)}`}>
                          {school.rating}/5
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(school.rating) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            {["Healthcare", "Shopping", "Transport", "Recreation"].map(category => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    {category === "Healthcare" && <Hospital className="w-5 h-5 mr-2 text-red-500" />}
                    {category === "Shopping" && <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />}
                    {category === "Transport" && <Car className="w-5 h-5 mr-2 text-blue-500" />}
                    {category === "Recreation" && <Home className="w-5 h-5 mr-2 text-purple-500" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {amenities.filter(amenity => amenity.category === category).map((amenity, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{amenity.name}</h5>
                          <p className="text-sm text-slate-600">{amenity.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{amenity.distance}km</div>
                          {amenity.rating && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm">{amenity.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="grid gap-4">
              {marketTrends.map((trend, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      {trend.period}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          R{trend.averagePrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600">Average Price</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${trend.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.priceChange >= 0 ? '+' : ''}{trend.priceChange}%
                        </div>
                        <div className="text-sm text-slate-600">Price Change</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {trend.salesVolume}
                        </div>
                        <div className="text-sm text-slate-600">Properties Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {trend.daysOnMarket}
                        </div>
                        <div className="text-sm text-slate-600">Avg. Days on Market</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <TrendingUp className="w-4 h-4 mt-1 mr-2 text-green-500" />
                    <p className="text-sm">The market has shown consistent growth over the past year with a {marketTrends[2]?.priceChange}% increase.</p>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mt-1 mr-2 text-blue-500" />
                    <p className="text-sm">Properties are selling {marketTrends[0]?.daysOnMarket < 75 ? 'faster' : 'slower'} than the regional average.</p>
                  </div>
                  <div className="flex items-start">
                    <BarChart3 className="w-4 h-4 mt-1 mr-2 text-purple-500" />
                    <p className="text-sm">Sales volume indicates {marketTrends[0]?.salesVolume > 40 ? 'strong' : 'moderate'} market activity in this area.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}