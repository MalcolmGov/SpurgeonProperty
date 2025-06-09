import SimpleHeader from "@/components/layout/simple-header";
import Footer from "@/components/layout/footer";
import PropertySearch from "@/components/property/property-search";
import PropertyCard from "@/components/property/property-card";
import PropertyCardSkeleton from "@/components/property/property-card-skeleton";
import SimpleAIAssistant from "@/components/SimpleAIAssistant";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { Link, useLocation } from "wouter";
import { Building, Users, TrendingUp, Award } from "lucide-react";
import propertyLogo from "@/assets/property-logo.svg";

export default function Home() {
  const { data: featuredProperties, isLoading } = useProperties({ featured: true, limit: 3 });
  const [, navigate] = useLocation();

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

  return (
    <>
      {/* SPURGEON PROPERTY HEADER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '90px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)',
        borderBottom: '4px solid #f59e0b',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3), 0 4px 16px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(12px)',
        borderImageSource: 'linear-gradient(90deg, #f59e0b, #eab308, #f59e0b)',
        borderImageSlice: 1
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={propertyLogo} 
            alt="SpurgeonProperty - Your Trusted Real Estate Partner" 
            style={{ height: '50px', width: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Home
          </a>
          <a href="/properties" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Properties
          </a>
          <a href="/about" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            About Us
          </a>
          <a href="/sell-property" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Sell Property
          </a>
          <a href="/admin/login" style={{
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Admin
          </a>
        </nav>
      </div>



      <div className="min-h-screen bg-slate-50 dark:bg-slate-900" style={{ marginTop: '90px' }}>
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
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
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
                <SimpleAIAssistant 
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
    </>
  );
}