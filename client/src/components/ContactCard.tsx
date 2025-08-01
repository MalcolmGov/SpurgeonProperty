import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContactCardProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function ContactCard({ variant = 'compact', className = '' }: ContactCardProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi Peter! I'm interested in your property services. Could you please assist me?");
    window.open(`https://wa.me/27842089307?text=${message}`, '_blank');
  };

  const handleEmailClick = () => {
    window.open('mailto:Peter@spurgeonproperty.com', '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+27842089307', '_blank');
  };

  if (variant === 'compact') {
    return (
      <Card className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Contact:</p>
            <h3 className="font-bold text-lg">Peter Spurgeon</h3>
            <p className="text-sm font-medium">084 208 9307</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              onClick={handlePhoneClick}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="text-center space-y-6">
        <div>
          <p className="text-purple-200 text-sm font-medium mb-2">Contact Our Expert</p>
          <h2 className="text-3xl font-bold mb-2">Peter Spurgeon</h2>
          <p className="text-xl font-semibold text-purple-100">084 208 9307</p>
          <p className="text-purple-200 mt-2">Peter@spurgeonproperty.com</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3"
            onClick={handlePhoneClick}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </Button>
          
          <Button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-700 font-semibold px-6 py-3"
            onClick={handleEmailClick}
          >
            <Mail className="w-5 h-5 mr-2" />
            Email
          </Button>
        </div>
        
        <div className="text-center text-purple-200 text-sm">
          <p>Available 7 days a week • 8AM - 8PM</p>
          <p className="mt-1">Professional Real Estate Services Across South Africa</p>
        </div>
      </div>
    </Card>
  );
}