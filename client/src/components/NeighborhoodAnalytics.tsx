import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  GraduationCap, 
  ShoppingCart, 
  Shield, 
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  Phone,
  Hospital,
  Car
} from "lucide-react";

interface NeighborhoodAnalyticsProps {
  latitude: number;
  longitude: number;
  suburb: string;
  city: string;
}

interface SchoolData {
  name: string;
  type: "Primary" | "Secondary" | "Combined";
  rating: number;
  distance: number;
  fees?: string;
  address: string;
}

interface AmenityData {
  category: string;
  name: string;
  distance: number;
  rating?: number;
  type: string;
  address: string;
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

interface NeighborhoodData {
  schools: SchoolData[];
  amenities: AmenityData[];
  marketTrends: MarketTrend[];
  safetyRating: SafetyRating;
}

const getAmenityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hospital':
      return <Hospital className="h-4 w-4" />;
    case 'shopping_mall':
    case 'supermarket':
      return <ShoppingCart className="h-4 w-4" />;
    case 'transit_station':
      return <Car className="h-4 w-4" />;
    case 'pharmacy':
      return <Hospital className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

const getSafetyColor = (category: string) => {
  switch (category) {
    case 'Excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Good':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Average':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Below Average':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function NeighborhoodAnalytics({ latitude, longitude, suburb, city }: NeighborhoodAnalyticsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: analytics, isLoading, error } = useQuery<NeighborhoodData>({
    queryKey: ['/api/neighborhood/analytics', latitude, longitude, suburb, city],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        suburb: suburb || '',
        city: city || ''
      });
      
      const response = await fetch(`/api/neighborhood/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch neighborhood analytics');
      }
      return response.json();
    },
    enabled: !!latitude && !!longitude
  });

  if (!showDetails) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <Button 
            onClick={() => setShowDetails(true)}
            variant="outline" 
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            View Neighborhood Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2">Loading neighborhood insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Neighborhood analytics unavailable</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(false)}
              className="mt-2"
            >
              Hide
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Neighborhood Analytics
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(false)}
            >
              Hide
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {suburb}, {city}
          </p>
        </CardHeader>
      </Card>

      {/* Safety Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl font-bold">{analytics.safetyRating.overall}/100</div>
            <Badge className={getSafetyColor(analytics.safetyRating.category)}>
              {analytics.safetyRating.category}
            </Badge>
          </div>
          <div className="space-y-1">
            {analytics.safetyRating.factors.map((factor, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                • {factor}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.marketTrends.map((trend, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{trend.period}</h4>
                  <Badge variant={trend.priceChange >= 0 ? "default" : "destructive"}>
                    {trend.priceChange >= 0 ? '+' : ''}{trend.priceChange.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>Avg: {formatCurrency(trend.averagePrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{trend.daysOnMarket} days on market</span>
                  </div>
                </div>
                {index < analytics.marketTrends.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Nearby Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.schools.slice(0, 5).map((school, index) => (
              <div key={index} className="border-l-4 border-purple-200 dark:border-purple-800 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{school.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{school.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <Badge variant="outline" className="text-xs">
                    {school.type}
                  </Badge>
                  <span>{school.distance.toFixed(1)}km away</span>
                  {school.fees && <span>{school.fees}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Local Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.amenities.slice(0, 8).map((amenity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getAmenityIcon(amenity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{amenity.name}</p>
                    <span className="text-xs text-gray-500 ml-2">
                      {amenity.distance.toFixed(1)}km
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {amenity.category}
                    </Badge>
                    {amenity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{amenity.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}