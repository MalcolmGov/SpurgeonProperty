import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PropertyWithAgent } from "@shared/schema";

interface SocialShareProps {
  property: PropertyWithAgent;
  url?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  getUrl: (url: string, title: string, description: string) => string;
}

const sharePlatforms: SharePlatform[] = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (url, title, description) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ' - ' + description)}`
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "bg-sky-500 hover:bg-sky-600",
    getUrl: (url, title, description) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + ' - ' + description)}&hashtags=property,realestate,southafrica`
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700 hover:bg-blue-800",
    getUrl: (url, title, description) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-600 hover:bg-green-700",
    getUrl: (url, title, description) => 
      `https://wa.me/?text=${encodeURIComponent(title + ' - ' + description + ' ' + url)}`
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-600 hover:bg-gray-700",
    getUrl: (url, title, description) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\nView property: ' + url)}`
  }
];

export default function SocialShare({ property, url }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  const currentUrl = url || `${window.location.origin}/properties/${property.id}`;
  const title = property.title;
  const description = `${property.propertyType} in ${property.suburb}, ${property.city} - R${parseInt(property.price).toLocaleString('en-ZA')} - ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.area}sqm`;
  const imageUrl = property.images && property.images.length > 0 ? 
    (property.images[0].startsWith('http') ? property.images[0] : `${window.location.origin}${property.images[0]}`) : 
    `${window.location.origin}/api/og-image/${property.id}`;

  const handleShare = (platform: SharePlatform) => {
    const shareText = customMessage || description;
    const shareUrl = platform.getUrl(currentUrl, title, shareText);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      const shareText = customMessage || description;
      const fullText = `${title}\n${shareText}\n${currentUrl}`;
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copied to clipboard",
        description: "Property details copied successfully"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link copied",
        description: "Property link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Property</DialogTitle>
        </DialogHeader>
        
        {/* Property Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex gap-3">
            {property.images && property.images.length > 0 && (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                      <rect width="64" height="64" fill="#f3f4f6"/>
                      <text x="32" y="32" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="10" fill="#9ca3af">
                        Property
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{property.title}</h3>
              <p className="text-xs text-muted-foreground">
                {property.suburb}, {property.city}
              </p>
              <p className="text-sm font-medium text-green-600">
                R{parseInt(property.price).toLocaleString('en-ZA')}
              </p>
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Custom Message (Optional)</Label>
          <textarea
            id="message"
            placeholder="Add your own message..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full p-2 border rounded-md resize-none h-20 text-sm"
          />
        </div>

        {/* Share Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {sharePlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(platform)}
                  className={`flex items-center gap-2 text-white ${platform.color} border-0`}
                >
                  <IconComponent className="h-4 w-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* Copy Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="flex-1 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* Link Preview */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <strong>Link:</strong> {currentUrl}
        </div>
      </DialogContent>
    </Dialog>
  );
}