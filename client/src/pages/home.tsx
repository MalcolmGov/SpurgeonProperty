import SimpleHeader from "@/components/layout/simple-header";
import Footer from "@/components/layout/footer";
import PropertySearch from "@/components/property/property-search";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { Link } from "wouter";
import { Building, Users, TrendingUp, Award } from "lucide-react";
import spurgeonLogo from "@/assets/spurgeon-logo.svg";
import luxuryMansion from "@assets/image_1749195054251.png";

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
        backdropFilter: 'blur(12px)',
        borderImageSource: 'linear-gradient(90deg, #f59e0b, #eab308, #f59e0b)',
        borderImageSlice: 1
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={spurgeonLogo} 
            alt="Spurgeon Property" 
            style={{ height: '70px', width: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
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
          <a href="/sell-property" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Sell Property
          </a>
          <a href="/map" style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            Map
          </a>
          <a href="/admin" style={{
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
        <section className="relative h-screen">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${luxuryMansion})` }}
          ></div>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Find Your Perfect
                <br />
                <span className="text-orange-500">Dream Home</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
                Discover exceptional properties in South Africa's most desirable locations with personalized service from our expert agents
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/properties">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl">
                    Explore Properties
                  </Button>
                </Link>
                <Link href="/sell-property">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-xl">
                    Sell Your Property
                  </Button>
                </Link>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
                <PropertySearch />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-gray-300">Properties Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">200+</div>
                <div className="text-gray-300">Happy Clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-gray-300">Areas Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">150+</div>
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
                  <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-xl h-96 animate-pulse"></div>
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
                <div className="w-16 h-16 bg-green-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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
                <div className="w-16 h-16 bg-blue-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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