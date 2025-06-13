
import Footer from "@/components/layout/footer";
import PropertySearch from "@/components/property/property-search";
import PropertyCard from "@/components/property/property-card";
import PropertyCardSkeleton from "@/components/property/property-card-skeleton";
import AIAssistant from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useProperties } from "@/hooks/use-properties";
import { Link, useLocation } from "wouter";
import { Building, Users, TrendingUp, Award } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: featuredProperties, isLoading } = useProperties({ featured: true, limit: 3 });
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<number[]>([]);

  const handleAISearch = (query: string, filters: any) => {
    // Navigate to properties page with search parameters
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('search', query);
    if (filters.propertyType) searchParams.set('propertyType', filters.propertyType);
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) searchParams.set('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) searchParams.set('bathrooms', filters.bathrooms.toString());
    if (filters.suburb) searchParams.set('suburb', filters.suburb);
    if (filters.city) searchParams.set('city', filters.city);
    
    navigate(`/properties?${searchParams.toString()}`);
  };

  const handleCompareToggle = (propertyId: number) => {
    setComparisonProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else if (prev.length < 4) {
        return [...prev, propertyId];
      }
      return prev;
    });
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* SPURGEON PROPERTY HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 border-b-4 border-orange-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2">
                  <Logo variant="white" />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/properties" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                Properties
              </Link>
              <Link href="/about" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/sell-property" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                Sell Property
              </Link>
              <Link href="/admin/login" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Admin
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-orange-300 p-2 rounded-md"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-purple-800 rounded-lg mt-2">
                <Link href="/" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                  Home
                </Link>
                <Link href="/properties" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                  Properties
                </Link>
                <Link href="/about" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                  About
                </Link>
                <Link href="/sell-property" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                  Sell Property
                </Link>
                <Link href="/admin/login" className="bg-orange-500 hover:bg-orange-600 text-white block px-3 py-2 rounded-lg text-base font-medium mt-2">
                  Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>



      <div className="page-container min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-slate-900/30"></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your Gateway to
                <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Premium Properties
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover exceptional South African real estate with SpurgeonProperty - your trusted partner for premium property investments and dream homes
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Link href="/properties">Explore Properties</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-white text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  <Link href="/sell-property">Sell Your Property</Link>
                </Button>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto">
              <PropertySearch />
            </div>
          </div>

          {/* Stats Section */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-gray-300">Properties Listed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">200+</div>
                <div className="text-gray-300">Happy Clients</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-gray-300">Areas Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">150+</div>
                <div className="text-gray-300">Expert Agents</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Featured Properties
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Discover handpicked properties that offer exceptional value and prime locations
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <PropertyCardSkeleton key={i} index={i - 1} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties?.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="border-2 border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white">
                <Link href="/properties">View All Properties</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                  Your Personal Property Assistant
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                  Get instant answers about properties, neighborhoods, financing, and market insights. Our AI assistant is trained on South African real estate and is here to help you make informed decisions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Property search and recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Mortgage calculations and financing advice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Neighborhood insights and market trends</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Investment guidance and property valuations</span>
                  </div>
                </div>
              </div>
              
              <div>
                <AIAssistant 
                  onSearchQuery={handleAISearch}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Why Choose Spurgeon Property
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                We provide comprehensive real estate services with cutting-edge technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Premium Properties
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Carefully curated selection of luxury and family homes
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-orange-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Expert Agents
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Professional agents with deep market knowledge
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Market Insights
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Data-driven analysis and neighborhood analytics
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Trusted Service
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Recognized excellence in real estate services
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}