import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/PropertyCard";
import { Search, TrendingUp, Users, Home as HomeIcon, Award } from "lucide-react";
import type { Property } from "@shared/schema";

interface SearchForm {
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchForm, setSearchForm] = useState<SearchForm>({
    location: "",
    propertyType: "",
    priceRange: "",
    bedrooms: "",
  });

  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.location) params.set("location", searchForm.location);
    if (searchForm.propertyType && searchForm.propertyType !== "any") params.set("propertyType", searchForm.propertyType);
    if (searchForm.priceRange && searchForm.priceRange !== "any") {
      const [min, max] = searchForm.priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max && max !== "+") params.set("maxPrice", max);
    }
    if (searchForm.bedrooms && searchForm.bedrooms !== "any") params.set("bedrooms", searchForm.bedrooms);
    
    setLocation(`/properties?${params.toString()}`);
  };

  const updateSearchForm = (key: keyof SearchForm, value: string) => {
    setSearchForm(prev => ({ ...prev, [key]: value }));
  };

  const statsData = [
    { label: "Properties", value: "12,500+", icon: HomeIcon },
    { label: "Happy Clients", value: "8,200+", icon: Users },
    { label: "Sold Properties", value: "15,600+", icon: TrendingUp },
    { label: "Expert Agents", value: "150+", icon: Award },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Modern city skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Find Your{" "}
              <span className="gradient-purple-orange bg-clip-text text-transparent">
                Dream Home
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Discover exceptional properties with our advanced search technology and expert guidance
            </p>
          </div>

          {/* Search Bar */}
          <Card className="glass-morphism max-w-4xl mx-auto animate-fade-in">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Location</label>
                  <Input
                    placeholder="Enter city or neighborhood"
                    value={searchForm.location}
                    onChange={(e) => updateSearchForm("location", e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Property Type</label>
                  <Select
                    value={searchForm.propertyType}
                    onValueChange={(value) => updateSearchForm("propertyType", value)}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Price Range</label>
                  <Select
                    value={searchForm.priceRange}
                    onValueChange={(value) => updateSearchForm("priceRange", value)}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Price</SelectItem>
                      <SelectItem value="0-300000">Under $300K</SelectItem>
                      <SelectItem value="300000-500000">$300K - $500K</SelectItem>
                      <SelectItem value="500000-1000000">$500K - $1M</SelectItem>
                      <SelectItem value="1000000-">$1M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Bedrooms</label>
                  <Select
                    value={searchForm.bedrooms}
                    onValueChange={(value) => updateSearchForm("bedrooms", value)}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleSearch}
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Properties
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 mr-2" />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked properties that offer exceptional value and prime locations
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose PropertyHub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of real estate with our innovative platform and expert team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Advanced Search
                </h3>
                <p className="text-muted-foreground">
                  Find your perfect property with our intelligent search filters and AI-powered recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Expert Agents
                </h3>
                <p className="text-muted-foreground">
                  Work with our certified real estate professionals who know the local market inside and out.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Trusted Service
                </h3>
                <p className="text-muted-foreground">
                  Join thousands of satisfied clients who have found their dream homes through our platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let our expert team help you navigate the real estate market and find the perfect property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Contact an Agent
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 dark:bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 gradient-purple-orange rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">PropertyHub</span>
              </div>
              <p className="text-slate-300 mb-6">
                Your trusted partner in finding the perfect home. Expert guidance, exceptional service.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/properties" className="hover:text-white transition-colors">Properties</Link></li>
                <li><Link href="/agents" className="hover:text-white transition-colors">Agents</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Buy Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sell Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rent Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Management</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center space-x-3">
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>info@propertyhub.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>123 Real Estate Ave<br />Los Angeles, CA 90210</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 PropertyHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
