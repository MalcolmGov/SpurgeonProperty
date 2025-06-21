import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLeadSchema } from "@shared/schema";
import { X, Calendar, Phone, Mail, MessageCircle, User, Clock, Send } from "lucide-react";

interface ContactFormProps {
  propertyId?: number;
  agentId?: number | null;
  onClose: () => void;
}

interface WhatsAppButtonProps {
  propertyId?: number;
  agentId?: number | null;
  formData: any;
  onClose: () => void;
}

function WhatsAppButton({ propertyId, agentId, formData, onClose }: WhatsAppButtonProps) {
  const { data: property } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  const { data: agent } = useQuery({
    queryKey: [`/api/agents/${agentId}`],
    enabled: !!agentId,
  });

  const handleWhatsAppClick = () => {
    const targetAgent = agent || property?.agent;
    if (!targetAgent?.phone) return;

    const inquiryTypeMap: Record<string, string> = {
      viewing_request: "schedule a viewing",
      info_request: "get more information",
      price_negotiation: "discuss pricing",
      financing_help: "get financing assistance",
      offer_submission: "submit an offer",
      general_inquiry: "make a general inquiry"
    };

    const inquiryText = inquiryTypeMap[formData.inquiryType] || "inquire about the property";
    const timeText = formData.preferredContactTime !== "anytime" 
      ? ` I prefer to be contacted in the ${formData.preferredContactTime}.`
      : "";

    const message = `Hi ${targetAgent.name}, I'm ${formData.name} and I'd like to ${inquiryText}${propertyId ? ` for property ID ${propertyId}` : ""}.${timeText} ${formData.message || ""} You can reach me at ${formData.email}${formData.phone ? ` or ${formData.phone}` : ""}.`;

    const phoneNumber = targetAgent.phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/27${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const targetAgent = agent || property?.agent;

  if (!targetAgent?.phone) {
    return null;
  }

  return (
    <Button
      type="button"
      onClick={handleWhatsAppClick}
      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp {targetAgent.name}
    </Button>
  );
}

export default function ContactForm({ propertyId, agentId, onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    inquiryType: "viewing_request",
    preferredContactTime: "anytime"
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createLeadMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        message: data.message,
        propertyId: propertyId || undefined,
        agentId: agentId || undefined,
        source: "website",
        status: "new",
        priority: "medium"
      };

      // Validate data
      const validatedData = insertLeadSchema.parse(leadData);
      
      await apiRequest("POST", "/api/leads", validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success!",
        description: "Your inquiry has been submitted successfully. We'll get back to you within 24 hours!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit your inquiry. Please try again.",
        variant: "destructive",
      });
      console.error("Contact form error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name, email, and message to continue.",
        variant: "destructive",
      });
      return;
    }

    createLeadMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-white">
              Get in Touch with Agent
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Submit your details and we'll connect you with the property agent within 24 hours.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-purple-500" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Smith"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-purple-500" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                className="mt-1"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4 text-purple-500" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+27 12 345 6789"
              className="mt-1"
            />
          </div>
          
          {/* Inquiry Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inquiryType" className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                Inquiry Type
              </Label>
              <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange("inquiryType", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewing_request">Schedule Viewing</SelectItem>
                  <SelectItem value="info_request">Request Information</SelectItem>
                  <SelectItem value="price_negotiation">Price Negotiation</SelectItem>
                  <SelectItem value="financing_help">Financing Assistance</SelectItem>
                  <SelectItem value="offer_submission">Submit Offer</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="preferredContactTime" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-purple-500" />
                Preferred Contact Time
              </Label>
              <Select value={formData.preferredContactTime} onValueChange={(value) => handleInputChange("preferredContactTime", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                  <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              Message *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Hi, I'm interested in this property. Could you please provide more information about viewing times, pricing details, and any additional features included..."
              rows={4}
              className="mt-1"
              required
            />
          </div>
          
          {/* Trust Indicators */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Fast Response Guarantee</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Our agents respond to all inquiries within 2-4 hours during business hours.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Or get instant response via WhatsApp
              </div>
              <WhatsAppButton 
                propertyId={propertyId}
                agentId={agentId}
                formData={formData}
                onClose={onClose}
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}