import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Building2, 
  Users, 
  Star, 
  TrendingUp, 
  Shield, 
  Heart,
  Search,
  MapPin,
  Calculator,
  MessageCircle,
  Camera,
  FileText,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Search,
      title: "Advanced Property Search",
      description: "Powerful search filters to find your perfect property by location, price, bedrooms, and more."
    },
    {
      icon: MapPin,
      title: "Interactive Maps",
      description: "Explore properties with our interactive mapping system and neighborhood insights."
    },
    {
      icon: Calculator,
      title: "Property Valuation Tools",
      description: "Get accurate property valuations and market analysis to make informed decisions."
    },
    {
      icon: MessageCircle,
      title: "Expert Agent Support",
      description: "Connect with certified real estate professionals for personalized guidance."
    },
    {
      icon: Camera,
      title: "Virtual Property Tours",
      description: "Experience properties remotely with high-quality photos and virtual walkthroughs."
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Secure handling of all property documents and transaction paperwork."
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We believe in honest dealings and complete transparency throughout your property journey."
    },
    {
      icon: Heart,
      title: "Client-Centric Approach",
      description: "Your needs and satisfaction are at the heart of everything we do."
    },
    {
      icon: Award,
      title: "Excellence in Service",
      description: "We strive for excellence in every interaction and transaction."
    },
    {
      icon: TrendingUp,
      title: "Innovation & Growth",
      description: "Continuously improving our platform with the latest technology and market insights."
    }
  ];

  const stats = [
    { number: "500+", label: "Properties Listed" },
    { number: "200+", label: "Happy Clients" },
    { number: "50+", label: "Areas Covered" },
    { number: "150+", label: "Expert Agents" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Background House Image */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Modern luxury house with beautiful architecture" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Spurgeon Property
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner in finding exceptional properties across South Africa's most desirable locations
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                At Spurgeon Property, we're dedicated to revolutionizing the South African real estate market by providing 
                a comprehensive, user-friendly platform that connects buyers, sellers, and agents seamlessly.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                We believe that finding your dream home or investment property should be an exciting journey, 
                not a stressful ordeal. That's why we've built a platform that combines cutting-edge technology 
                with personalized service to deliver exceptional results.
              </p>
              <Link href="/properties">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Explore Properties
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-purple-600 rounded-2xl p-8 text-white">
                <Building2 className="w-16 h-16 mb-6 text-white/90" />
                <h3 className="text-2xl font-bold mb-4">15+ Years Experience</h3>
                <p className="text-lg opacity-90">
                  With over a decade and a half in the South African property market, 
                  we understand the unique challenges and opportunities in our diverse landscape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The principles that guide everything we do at Spurgeon Property
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover the powerful tools and features that make property searching and selling easier than ever
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                Why Choose Spurgeon Property?
              </h2>
              <div className="space-y-4">
                {[
                  "Comprehensive property database with detailed listings",
                  "Advanced search and filtering capabilities",
                  "Expert local market knowledge and insights",
                  "Dedicated support throughout your property journey",
                  "Secure and transparent transaction processes",
                  "Cutting-edge technology for better user experience"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-slate-600 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                <Users className="w-16 h-16 mb-6 text-white/90" />
                <h3 className="text-2xl font-bold mb-4">Professional Team</h3>
                <p className="text-lg opacity-90 mb-6">
                  Our team consists of experienced real estate professionals, technology experts, 
                  and customer service specialists dedicated to your success.
                </p>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="ml-2 font-semibold">4.9/5 Client Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have found their perfect homes through Spurgeon Property
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8">
                Browse Properties
              </Button>
            </Link>
            <Link href="/sell-property">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8">
                Sell Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}