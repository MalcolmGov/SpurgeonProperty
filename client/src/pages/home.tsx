
import Footer from "@/components/layout/footer";
import PropertySearch from "@/components/property/property-search";
import PropertyCard from "@/components/PropertyCard";
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
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    onCompareToggle={() => handleCompareToggle(property.id)}
                    isInComparison={comparisonProperties.includes(property.id)}
                    canAddToComparison={comparisonProperties.length < 4}
                  />
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

        {/* Comprehensive Value Propositions Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Why SpurgeonProperty is Your Best Choice
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Experience the future of South African real estate with our innovative platform, expert guidance, and unmatched service excellence
              </p>
            </div>

            {/* Primary Value Propositions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* AI-Powered Property Matching */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  AI-Powered Smart Search
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Our advanced AI assistant understands your preferences and finds properties that match your lifestyle, budget, and future goals. Get personalized recommendations in natural language.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    Natural language property searches
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    Personalized recommendations based on behavior
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    Instant answers to property questions
                  </li>
                </ul>
              </div>

              {/* Comprehensive Market Intelligence */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100 dark:border-orange-900">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  Deep Market Insights
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Make informed decisions with our comprehensive neighborhood analytics, school ratings, safety data, and real-time market trends for every property location.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    Live Google Maps integration for schools & amenities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    Safety ratings and crime statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    Property price trends and market forecasts
                  </li>
                </ul>
              </div>

              {/* Premium Agent Network */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 dark:border-green-900">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  Expert Agent Network
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Work with South Africa's top-rated real estate professionals who combine local expertise with cutting-edge tools to deliver exceptional results.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Verified credentials and performance ratings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Specialized knowledge in premium areas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    24/7 support and rapid response times
                  </li>
                </ul>
              </div>
            </div>

            {/* Secondary Benefits Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Secure Transactions</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">End-to-end encrypted processes and verified legal documentation</p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Lightning Fast</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Instant property searches and real-time market updates</p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Client-Focused</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Personalized service tailored to your unique needs and goals</p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Award Winning</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Industry recognition for excellence and innovation in real estate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Credibility Section */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                  Trusted by South Africa's Property Leaders
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                  Join thousands of satisfied clients who have successfully bought, sold, and invested in properties through our platform. Our track record speaks for itself.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">R2.5B+</div>
                    <div className="text-slate-600 dark:text-slate-400">Property Value Transacted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">98%</div>
                    <div className="text-slate-600 dark:text-slate-400">Client Satisfaction Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">45 Days</div>
                    <div className="text-slate-600 dark:text-slate-400">Average Time to Sale</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                    <div className="text-slate-600 dark:text-slate-400">AI Assistant Support</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl p-8">
                <div className="text-center">
                  <svg className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Verified & Secure</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    All properties are verified by our expert team. Your personal information and transactions are protected with bank-level security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Premium Platform Features
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Experience cutting-edge technology designed specifically for the South African property market
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

        {/* Comprehensive Call-to-Action Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-orange-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of satisfied clients who have discovered their dream homes and investment opportunities through SpurgeonProperty
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/properties">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 px-10 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Property Search
                </Button>
              </Link>
              <Link href="/sell-property">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105">
                  Sell Your Property
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <div>
                  <div className="font-bold text-lg">5-Star Service</div>
                  <div className="text-white/80 text-sm">Rated by 2,000+ clients</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold text-lg">Verified Properties</div>
                  <div className="text-white/80 text-sm">100% authentic listings</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold text-lg">Quick Response</div>
                  <div className="text-white/80 text-sm">Average 2-hour reply time</div>
                </div>
              </div>
            </div>

            {/* Additional Contact Options */}
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-white/90 mb-6 text-lg">
                Need personalized assistance? Our expert team is ready to help
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold">Call: +27 11 123 4567</span>
                </div>
                <div className="hidden sm:block text-white/60">|</div>
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">info@spurgeonproperty.co.za</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}