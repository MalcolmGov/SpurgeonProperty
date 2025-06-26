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
import { AnimatedPage, FadeInSection, StaggeredList, StaggeredItem, AnimatedCard } from "@/components/ui/animated-transitions";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    propertyType: "",
    province: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    featured: true,
    limit: 3
  });
  
  const { data: featuredProperties, isLoading, error, refetch } = useProperties(searchFilters);
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<number[]>([]);

  const handleAISearch = (query: string, filters: any) => {
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
    <AnimatedPage>
      <div style={{ margin: 0, padding: 0 }}>
        {/* SPURGEON PROPERTY HEADER */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 border-b-4 border-orange-400 shadow-lg"
        >
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
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/properties" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  Properties
                </Link>
                <Link href="/services" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  Services
                </Link>
                <Link href="/rentals" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  Rentals
                </Link>
                <Link href="/about" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  About
                </Link>
                <Link href="/sell-property" className="text-white hover:text-orange-300 px-3 py-2 text-sm font-medium transition-colors">
                  Sell Property
                </Link>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative text-white hover:text-orange-300 p-2 transition-colors"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 top-2 left-2 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </button>
                
                <button
                  onClick={() => {
                    window.open('https://online.mortgagemax.co.za/mfactory-braiden-elijah', '_blank');
                  }}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Start Application
                </button>
                <Link href="/admin/login" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Admin
                </Link>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:text-orange-300 p-2 rounded-md"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <motion.div
              initial={false}
              animate={mobileMenuOpen ? "open" : "closed"}
              variants={{
                open: { opacity: 1, height: "auto", y: 0 },
                closed: { opacity: 0, height: 0, y: -10 }
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-purple-800 rounded-lg mt-2">
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }}>
                  <Link href="/" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    Home
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.1 }}>
                  <Link href="/properties" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    Properties
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.2 }}>
                  <Link href="/services" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    Services
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.3 }}>
                  <Link href="/rentals" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    Rentals
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.4 }}>
                  <Link href="/about" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    About
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.5 }}>
                  <Link href="/sell-property" className="text-white hover:text-orange-300 block px-3 py-2 text-base font-medium">
                    Sell Property
                  </Link>
                </motion.div>
                <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }} transition={{ delay: 0.6 }}>
                  <Link href="/admin/login" className="bg-orange-500 hover:bg-orange-600 text-white block px-3 py-2 rounded-lg text-base font-medium mt-2">
                    Admin
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.header>

        <div className="page-container min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-40 sm:pt-36 md:pt-24">
            {/* Responsive Background Images */}
            <div className="absolute inset-0">
              {/* Desktop Background - High quality villa image */}
              <img 
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Modern luxury villa with stunning architecture" 
                className="hidden md:block w-full h-full object-cover object-center"
              />
              {/* Mobile Background - Optimized for mobile viewing */}
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=85" 
                alt="Elegant modern home interior" 
                className="block md:hidden w-full h-full object-cover object-center"
              />
            </div>
            {/* Enhanced gradient overlay optimized for mobile readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-slate-900/60 to-purple-800/70 md:from-purple-900/60 md:via-slate-900/40 md:to-purple-800/50 z-10"></div>
            {/* Additional overlay for enhanced text readability on mobile */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/30 z-15"></div>
            
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <FadeInSection>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                    Your Gateway to Premium Properties
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
                >
                  Discover exceptional South African real estate with SpurgeonProperty - your trusted partner for premium property investments and dream homes
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                      <Link href="/properties">Explore Properties</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="border-2 border-white text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-900 px-6 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                      <Link href="/sell-property">Sell Property</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="border-2 border-white text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-900 px-6 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                      <Link href="/rentals">Rent Property</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </FadeInSection>

              {/* Search Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto"
              >
                <PropertySearch onSearchChange={setSearchFilters} />
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-8"
            >
              <StaggeredList className="max-w-7xl mx-auto grid grid-cols-2 gap-8 text-center">
                <StaggeredItem>
                  <div className="text-3xl md:text-4xl font-bold text-white">200+</div>
                  <div className="text-gray-300">Happy Clients</div>
                </StaggeredItem>
                <StaggeredItem>
                  <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                  <div className="text-gray-300">Areas Covered</div>
                </StaggeredItem>
              </StaggeredList>
            </motion.div>
          </section>

          {/* Featured Properties */}
          <FadeInSection>
            <section className="py-20 bg-white dark:bg-slate-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                      {searchFilters.search ? `Search Results for "${searchFilters.search}"` : "Featured Properties"}
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    {searchFilters.search ? `Found ${featuredProperties?.length || 0} properties matching your search` : "Discover handpicked properties that offer exceptional value and prime locations"}
                  </p>
                </motion.div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <PropertyCardSkeleton index={i - 1} />
                      </motion.div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-slate-500 dark:text-slate-400 text-lg mb-4">
                      Unable to load featured properties
                    </div>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        onClick={() => refetch()}
                        className="mr-3"
                      >
                        Try Again
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/properties">Browse All Properties</Link>
                      </Button>
                    </div>
                  </div>
                ) : featuredProperties && featuredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {featuredProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <PropertyCard 
                          property={property}
                          onCompareToggle={() => handleCompareToggle(property.id)}
                          isInComparison={comparisonProperties.includes(property.id)}
                          canAddToComparison={comparisonProperties.length < 4}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-500 dark:text-slate-400 text-lg mb-4">
                      No featured properties available at the moment
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/properties">Browse All Properties</Link>
                    </Button>
                  </div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-center mt-12"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-2 border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white">
                      <Link href="/properties">View All Properties</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          </FadeInSection>

          {/* Value Propositions Section */}
          <FadeInSection>
            <section className="py-20 bg-gradient-to-br from-purple-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                      Why Choose Spurgeon Property?
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    Your trusted partner in South African real estate with proven results and cutting-edge technology
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {/* AI-Powered Smart Search */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">AI-Powered Smart Search</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Our advanced AI assistant understands your preferences and helps you find the perfect property with intelligent recommendations and instant answers.
                    </p>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      GPT-4o Technology • 24/7 Available
                    </div>
                  </motion.div>

                  {/* Deep Market Insights */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Deep Market Insights</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Access comprehensive neighborhood analytics, school ratings, amenities, safety data, and market trends powered by Google Maps integration.
                    </p>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Google Maps API • Real-time Data
                    </div>
                  </motion.div>

                  {/* Expert Agent Network */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Expert Agent Network</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Connect with our carefully vetted network of professional agents who specialize in South African markets and provide personalized service.
                    </p>
                    <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      150+ Verified Agents • Local Expertise
                    </div>
                  </motion.div>

                  {/* Comprehensive Property Tools */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Comprehensive Property Tools</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Access advanced mortgage calculators, affordability analysis, and property comparison tools to make informed investment decisions.
                    </p>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Financial Planning • Investment Analysis
                    </div>
                  </motion.div>

                  {/* Premium Support */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Premium Support</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Enjoy white-glove service with dedicated support, instant email notifications, and priority access to new listings and market opportunities.
                    </p>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      24/7 Support • Priority Access
                    </div>
                  </motion.div>

                  {/* Secure & Verified */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Secure & Verified</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      All properties and agents are thoroughly verified. Enjoy secure transactions with encrypted data protection and compliance with South African regulations.
                    </p>
                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                      SSL Encrypted • POPIA Compliant
                    </div>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-purple-600 to-orange-600 rounded-2xl p-8 text-white text-center"
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">Trusted by Thousands</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <div className="text-3xl md:text-4xl font-bold mb-2">R2.5B+</div>
                      <div className="text-purple-100">Property Value Transacted</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
                      <div className="text-purple-100">Client Satisfaction Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                      <div className="text-purple-100">Properties Sold This Year</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          </FadeInSection>

          {/* AI Assistant Section - Temporarily hidden */}
          {/* <FadeInSection>
            <section className="py-20 bg-slate-50 dark:bg-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                  <div className="order-2 lg:order-1">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
                    >
                      <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                        Your Personal Property Assistant
                      </span>
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8"
                    >
                      Get instant answers about properties, neighborhoods, financing, and market insights. Our AI assistant is trained on South African real estate and is here to help you make informed decisions.
                    </motion.p>
                    <StaggeredList className="space-y-3 sm:space-y-4">
                      <StaggeredItem>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Property search and recommendations</span>
                        </div>
                      </StaggeredItem>
                      <StaggeredItem>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Mortgage calculations and financing advice</span>
                        </div>
                      </StaggeredItem>
                      <StaggeredItem>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Neighborhood insights and market trends</span>
                        </div>
                      </StaggeredItem>
                      <StaggeredItem>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Investment guidance and property valuations</span>
                        </div>
                      </StaggeredItem>
                    </StaggeredList>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="order-1 lg:order-2 w-full"
                  >
                    <div className="max-w-full overflow-hidden">
                      <AIAssistant 
                        onSearchQuery={handleAISearch}
                        className="shadow-2xl w-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          </FadeInSection> */}

          <Footer />
        </div>
      </div>
    </AnimatedPage>
  );
}