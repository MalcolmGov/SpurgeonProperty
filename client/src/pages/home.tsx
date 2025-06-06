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
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Logo Icon */}
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              animation: 'shine 3s ease-in-out infinite'
            }}></div>
            <span style={{ 
              fontSize: '24px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              zIndex: 1
            }}>🏢</span>
          </div>
          
          {/* Brand Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
              letterSpacing: '-1px',
              fontFamily: '"Inter", sans-serif'
            }}>
              SpurgeonProperty
            </div>
            <div style={{
              fontSize: '12px',
              color: '#fbbf24',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginLeft: '2px'
            }}>
              Premium Real Estate
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '2rem',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Home
          </span>
          <span style={{ 
            color: '#e2e8f0',
            fontWeight: '500',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}>
            Properties
          </span>
          <span style={{ 
            color: '#e2e8f0',
            fontWeight: '500',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}>
            Admin
          </span>
        </nav>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900" style={{ marginTop: '90px' }}>
      
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
    </>
  );
}
