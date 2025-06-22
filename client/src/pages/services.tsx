import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Home, 
  Hammer, 
  Calculator, 
  Gavel,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import servicesWheel from "@assets/image_1750577117020.png";
import { useState } from "react";
import ContactForm from "@/components/forms/contact-form";

export default function ServicesPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const services = [
    {
      id: "property-investment",
      title: "Property & Investment Management",
      description: "Strategic property investment guidance and comprehensive portfolio management services to maximize your returns and minimize risks.",
      icon: Building2,
      features: [
        "Portfolio analysis and optimization",
        "Market research and investment strategies",
        "Rental yield calculations",
        "Property performance monitoring"
      ],
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      id: "financial-planning",
      title: "Financial Planning & Advisory",
      description: "Expert financial planning services tailored to real estate investments, helping you achieve your long-term wealth objectives.",
      icon: TrendingUp,
      features: [
        "Retirement planning through property",
        "Tax-efficient investment structures",
        "Risk assessment and mitigation",
        "Wealth preservation strategies"
      ],
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "homeloans",
      title: "Home Loans & Financing",
      description: "Comprehensive mortgage and financing solutions with competitive rates and personalized service from pre-approval to settlement.",
      icon: DollarSign,
      features: [
        "First-time buyer assistance",
        "Refinancing and debt consolidation",
        "Investment property loans",
        "Commercial property financing"
      ],
      gradient: "from-orange-500 to-red-600"
    },
    {
      id: "auctions",
      title: "Property Auctions",
      description: "Professional auction services for both buyers and sellers, ensuring transparent processes and optimal market outcomes.",
      icon: Gavel,
      features: [
        "Pre-auction property valuations",
        "Auction preparation and marketing",
        "Bidding strategy consultation",
        "Post-auction settlement support"
      ],
      gradient: "from-purple-500 to-pink-600"
    },
    {
      id: "property-acquisitions",
      title: "Property Acquisitions",
      description: "Strategic property sourcing and acquisition services, identifying opportunities that align with your investment goals.",
      icon: Home,
      features: [
        "Off-market property sourcing",
        "Due diligence and inspections",
        "Negotiation and purchase management",
        "Settlement coordination"
      ],
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      id: "commercial-development",
      title: "Commercial & Industrial Development",
      description: "End-to-end commercial and industrial development services from site selection to project completion and leasing.",
      icon: Hammer,
      features: [
        "Site feasibility studies",
        "Development project management",
        "Zoning and compliance assistance",
        "Commercial leasing strategies"
      ],
      gradient: "from-slate-600 to-gray-700"
    },
    {
      id: "business-planning",
      title: "Business Planning & Tax Advisory",
      description: "Comprehensive business planning and tax optimization strategies for property investors and real estate businesses.",
      icon: FileText,
      features: [
        "Business structure optimization",
        "Tax planning and compliance",
        "GST and stamp duty advice",
        "Capital gains strategies"
      ],
      gradient: "from-amber-500 to-orange-600"
    },
    {
      id: "capital-funding",
      title: "Business Capital Funding",
      description: "Access to diverse funding solutions for property development, investment expansion, and business growth initiatives.",
      icon: Calculator,
      features: [
        "Development finance solutions",
        "Joint venture partnerships",
        "Private lending options",
        "SMSF property investments"
      ],
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  const benefits = [
    "Comprehensive property expertise across all market segments",
    "Personalized service tailored to your investment objectives",
    "Access to exclusive off-market opportunities",
    "Integrated financial and tax planning services",
    "Professional network of industry specialists",
    "Proven track record of successful transactions"
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Comprehensive Real Estate
              <span className="block bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              From property acquisition to wealth management, we provide integrated solutions 
              that deliver exceptional results across every aspect of your real estate journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 py-3"
              >
                <Phone className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-purple-700 font-semibold px-8 py-3"
              >
                <Mail className="mr-2 h-5 w-5" />
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Our Professional Services
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Explore our comprehensive range of services designed to support every aspect 
              of your property investment and business objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsContactOpen(true)}
                    className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"
                  >
                    Get In Touch
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent mb-6">
                Why Choose Spurgeon Property?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                With decades of combined experience and a client-first philosophy, we deliver 
                exceptional results across every aspect of property investment and management.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button 
                  size="lg" 
                  onClick={() => setIsContactOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold px-8 py-3"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">R2.5B+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Property Value Transacted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Successful Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">98%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">15+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Wheel Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Our Client-Centric Approach
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Every service we offer revolves around our clients' success. Our integrated approach 
              ensures seamless coordination across all aspects of your property and investment needs.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src={servicesWheel} 
                alt="Spurgeon Property Services Wheel - Client Centric Approach" 
                className="w-full h-auto drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Property Investment Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Contact our expert team today for a personalized consultation and discover 
            how our comprehensive services can help you achieve your property goals.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => setIsContactOpen(true)}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 32px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#7c3aed',
                backgroundColor: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '6px',
                minWidth: '200px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#faf5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <Phone className="mr-2 h-5 w-5" style={{ color: 'inherit' }} />
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        propertyTitle="Services Consultation"
        inquiryType="Services Inquiry"
      />
    </div>
  );
}