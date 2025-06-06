import SimpleHeader from "@/components/layout/simple-header";
import Footer from "@/components/layout/footer";
import PropertySearch from "@/components/property/property-search";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { Link } from "wouter";
import { Building, Users, TrendingUp, Award } from "lucide-react";

export default function Home() {
  const { data: featuredProperties, isLoading } = useProperties({ featured: true, limit: 3 });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Direct Header */}
      <header style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '32px',
              height: '32px',
              backgroundColor: '#7c3aed',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              🏢
            </div>
            <span style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              PropertyHub
            </span>
          </div>
          <nav style={{ display: 'flex', gap: '32px' }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Home</span>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Properties</span>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Admin</span>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: '80px' }}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Modern city skyline" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Find Your
              <span className="gradient-purple-orange bg-clip-text text-transparent ml-4">
                Dream Home
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Discover exceptional South African properties with our advanced search technology and expert guidance
            </p>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6 max-w-4xl mx-auto animate-fade-in">
            <PropertySearch />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">12,500+</div>
              <div className="text-gray-300">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">8,200+</div>
              <div className="text-gray-300">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">15,600+</div>
              <div className="text-gray-300">Sold Properties</div>
            </div>
            <div className="text-center">
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
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-80 animate-pulse" />
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
            <Link href="/properties">
              <Button className="bg-orange-primary hover:bg-orange-secondary text-white px-8 py-3 text-lg">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Why Choose PropertyHub
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
                Professional real estate experts to guide your journey
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                Market Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Real-time market data and pricing analytics
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                Award Winning
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
  );
}
