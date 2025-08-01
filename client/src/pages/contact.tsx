import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Phone, Mail, MapPin, Clock, MessageSquare, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactFormData) => 
      apiRequest("/api/leads", "POST", {
        ...data,
        propertyId: null,
        status: "new",
        priority: "medium"
      }),
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-2">
              Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to find your dream property or sell your current one? Our expert team is here to help you every step of the way.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    Let's Connect
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Whether you're buying, selling, or renting, our experienced team is ready to provide personalized guidance tailored to your needs.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-6">
                  {/* Phone Contact Card */}
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-r from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Call Us Directly</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">Office: 011 391 2152</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <p className="text-lg text-gray-700 dark:text-gray-200">Peter Spurgeon: 084 208 9307</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <p className="text-lg text-gray-700 dark:text-gray-200">Louis Smit: 083 677 3748</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Available 7 days a week, 8AM - 8PM</p>
                      </div>
                    </div>
                  </Card>

                  {/* Email Contact Card */}
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Email Support</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <a href="mailto:Peter@spurgeonproperty.com" className="font-semibold text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                              Peter@spurgeonproperty.com
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <a href="mailto:louissm@spurgeonproperty.com" className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                              louissm@spurgeonproperty.com
                            </a>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">We respond within 2-4 hours during business days</p>
                      </div>
                    </div>
                  </Card>

                  {/* WhatsApp Contact Card */}
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-r from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">WhatsApp Chat</h3>
                        <div className="space-y-3">
                          <p className="text-gray-600 dark:text-gray-300">Get instant responses via WhatsApp</p>
                          <Button 
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                            onClick={() => {
                              const message = encodeURIComponent("Hi! I'm interested in your property services. Could you please assist me?");
                              window.open(`https://wa.me/27842089307?text=${message}`, '_blank');
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat on WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Service Areas Card */}
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-gradient-to-r from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Service Areas</h3>
                        <div className="text-gray-600 dark:text-gray-300">
                          <p className="text-lg mb-2">Serving all major areas across South Africa</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'].map((city) => (
                              <Badge key={city} variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                        <div className="space-y-1 text-gray-600 dark:text-gray-300">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 4:00 PM</p>
                          <p>Sunday: By appointment only</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card className="p-8">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                      <span>Send us a Message</span>
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Full Name *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+27 123 456 789"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Inquiry Type
                          </label>
                          <select
                            value={formData.inquiryType}
                            onChange={(e) => handleInputChange("inquiryType", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="buying">Buying Property</option>
                            <option value="selling">Selling Property</option>
                            <option value="renting">Renting Property</option>
                            <option value="investment">Investment Opportunities</option>
                            <option value="valuation">Property Valuation</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Subject
                        </label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder="Brief subject of your inquiry"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Message *
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Please provide details about your inquiry..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-3 text-lg font-semibold"
                      >
                        {submitMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-600/5 to-orange-500/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Why Choose Spurgeon Property?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">15+</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Years Experience</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Extensive knowledge of the South African property market
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">98%</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Client Satisfaction</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Exceptional service and results for our clients
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">24/7</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Support Available</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Always here to assist with your property needs
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}