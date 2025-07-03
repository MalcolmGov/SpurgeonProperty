import { useParams } from "wouter";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyGallery from "@/components/property/property-gallery";
import ContactForm from "@/components/forms/contact-form";
import MortgageCalculator from "@/components/MortgageCalculator";
import { NeighborhoodAnalytics } from "@/components/NeighborhoodAnalytics";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar, 
  Phone, 
  Heart,
  Share2,
  Car,
  Star,
  Check,
  MessageCircle
} from "lucide-react";
import type { PropertyWithAgent } from "@shared/schema";

export default function PropertyDetail() {
  const params = useParams();
  const propertyId = parseInt(params.id || "0");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const { data: property, isLoading } = useQuery<PropertyWithAgent>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-slate-200 dark:bg-slate-700 h-96 rounded-2xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-200 dark:bg-slate-700 h-8 rounded" />
                <div className="bg-slate-200 dark:bg-slate-700 h-32 rounded" />
              </div>
              <div className="bg-slate-200 dark:bg-slate-700 h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Property not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    if (!price || price === '' || price === 'null' || price === 'undefined') {
      return 'Price on request';
    }
    
    // If price is already formatted (starts with "R"), return as is
    if (price.toString().trim().startsWith('R')) {
      return price.toString().trim();
    }
    
    // Extract numeric value from string
    const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    
    if (isNaN(numericPrice)) {
      return 'Price on request';
    }
    
    return `R ${new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">

      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/properties">Properties</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{property.title}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Property Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <PropertyGallery images={property.images || []} title={property.title} />
          </div>
          
          {/* Property Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-purple-primary">
                    {formatPrice(property.price)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorited(!isFavorited)}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                    </Button>

                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {property.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-6 flex items-center">
                  <MapPin className="w-4 h-4 text-orange-primary mr-2" />
                  {property.address}, {property.suburb}, {property.city}, {property.province} {property.postalCode}
                </p>
                
                {/* Property Features */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{property.bedrooms}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      <Bed className="w-4 h-4 mr-1" />
                      Bedrooms
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{property.bathrooms}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      <Bath className="w-4 h-4 mr-1" />
                      Bathrooms
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {property.area.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      <Square className="w-4 h-4 mr-1" />
                      Sq Ft
                    </div>
                  </div>
                </div>
                
                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Viewing
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Agent
                  </Button>
                  {property.agent?.phone && (
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                      onClick={() => {
                        const message = `Hi ${property.agent?.name}, I'm interested in the property "${property.title}" (ID: ${property.id}). Could you please provide more information?`;
                        const phoneNumber = property.agent?.phone?.replace(/[^\d]/g, '');
                        const whatsappUrl = `https://wa.me/27${phoneNumber?.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp Agent
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  >
                    Virtual Tour
                  </Button>
                </div>
                
                {/* Agent Info */}
                {property.agent && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      <img
                        src={property.agent.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60"}
                        alt={property.agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">
                          {property.agent.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          {property.agent.rating} Rating
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Property Details Tabs */}
        <Card className="shadow-lg">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <TabsTrigger 
                value="overview" 
                className="flex-1 h-12 text-base font-semibold rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              >
                📊 Overview
              </TabsTrigger>
              <TabsTrigger 
                value="features"
                className="flex-1 h-12 text-base font-semibold rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              >
                ⭐ Features
              </TabsTrigger>
              <TabsTrigger 
                value="neighborhood"
                className="flex-1 h-12 text-base font-semibold rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              >
                🏘️ Neighborhood
              </TabsTrigger>
              {property.videos && property.videos.length > 0 && (
                <TabsTrigger 
                  value="videos"
                  className="flex-1 h-12 text-base font-semibold rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  🎥 Videos
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                    Property Description
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {property.description}
                  </p>
                </div>
                
                {property.additionalInfo && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                      Additional Information
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      {property.additionalInfo}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Property Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Property Type:</span>
                        <span className="capitalize">{property.propertyType}</span>
                      </div>
                      {property.yearBuilt && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Year Built:</span>
                          <span>{property.yearBuilt}</span>
                        </div>
                      )}
                      {property.lotSize && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Lot Size:</span>
                          <span>{property.lotSize}</span>
                        </div>
                      )}
                      {property.parking && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Parking:</span>
                          <span>{property.parking}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Status:</span>
                        <Badge variant="secondary" className="capitalize">{property.status}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Key Features</h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      {property.features?.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.features?.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="neighborhood">
                {property.latitude && property.longitude ? (
                  <NeighborhoodAnalytics 
                    latitude={parseFloat(property.latitude)}
                    longitude={parseFloat(property.longitude)}
                    suburb={property.suburb}
                    city={property.city}
                  />
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Neighborhood Information
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Location coordinates needed for neighborhood analytics.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="videos">
                {(property.videos && property.videos.length > 0) || (property.videoUrls && property.videoUrls.length > 0) ? (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                      Property Videos
                    </h3>
                    
                    {/* Uploaded Video Files */}
                    {property.videos && property.videos.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                          Uploaded Videos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {property.videos.map((video, index) => (
                            <div key={index} className="space-y-2">
                              <video 
                                controls 
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
                                preload="metadata"
                              >
                                <source src={video} type="video/mp4" />
                                <source src={video} type="video/webm" />
                                <source src={video} type="video/quicktime" />
                                Your browser does not support the video tag.
                              </video>
                              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                Video {index + 1}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Video URLs */}
                    {property.videoUrls && property.videoUrls.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                          External Videos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {property.videoUrls.map((url, index) => {
                            // Extract video ID for YouTube and Vimeo for embedding
                            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                            const isVimeo = url.includes('vimeo.com');
                            
                            let embedUrl = '';
                            if (isYouTube) {
                              const videoId = url.includes('youtu.be/') 
                                ? url.split('youtu.be/')[1]?.split('?')[0]
                                : url.split('v=')[1]?.split('&')[0];
                              if (videoId) {
                                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                              }
                            } else if (isVimeo) {
                              const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                              if (videoId) {
                                embedUrl = `https://player.vimeo.com/video/${videoId}`;
                              }
                            }

                            return (
                              <div key={index} className="space-y-3">
                                {embedUrl ? (
                                  <iframe
                                    src={embedUrl}
                                    className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-700"
                                    allowFullScreen
                                    title={`External Video ${index + 1}`}
                                  />
                                ) : (
                                  <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-2">
                                    <span className="text-4xl">🎥</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">External Video</p>
                                    <a 
                                      href={url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                                    >
                                      Open Video Link
                                    </a>
                                  </div>
                                )}
                                <div className="text-center space-y-1">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isYouTube ? '📺 YouTube Video' : isVimeo ? '🎬 Vimeo Video' : '🎥 External Video'}
                                  </p>
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                  >
                                    Open in new tab →
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      No Videos Available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      No property videos have been uploaded yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
        
        {/* Contact Agent Section */}
        <Card className="mt-8 shadow-lg border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Interested in This Property?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Get in touch with our agent for more information, schedule a viewing, or submit an inquiry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg h-12"
                  onClick={() => setShowContactForm(true)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Viewing
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg h-12"
                  onClick={() => setShowContactForm(true)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Agent
                </Button>
                {property.agent?.phone && (
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg h-12"
                    onClick={() => {
                      const message = `Hi ${property.agent?.name}, I'm interested in the property "${property.title}" (ID: ${property.id}). Could you please provide more information?`;
                      const phoneNumber = property.agent?.phone?.replace(/[^\d]/g, '');
                      const whatsappUrl = `https://wa.me/27${phoneNumber?.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mortgage Calculator */}
        <div className="mt-8">
          <MortgageCalculator propertyPrice={parseInt(property.price)} />
        </div>
      </div>
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          propertyId={property.id}
          agentId={property.agentId}
          onClose={() => setShowContactForm(false)}
        />
      )}
      
      <Footer />
    </div>
  );
}
