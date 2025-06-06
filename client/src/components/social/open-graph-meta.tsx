import { useEffect } from "react";
import type { PropertyWithAgent } from "@shared/schema";

interface OpenGraphMetaProps {
  property?: PropertyWithAgent;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function OpenGraphMeta({ 
  property, 
  title, 
  description, 
  image, 
  url 
}: OpenGraphMetaProps) {
  useEffect(() => {
    // Clean up existing meta tags
    const existingMetas = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    existingMetas.forEach(meta => meta.remove());

    // Generate meta tags data
    let metaTitle = title;
    let metaDescription = description;
    let metaImage = image;
    let metaUrl = url || window.location.href;

    if (property) {
      metaTitle = property.title;
      metaDescription = `${property.propertyType} in ${property.suburb}, ${property.city} - R${parseInt(property.price).toLocaleString('en-ZA')} - ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.area}sqm`;
      metaImage = property.images && property.images.length > 0 ? 
        (property.images[0].startsWith('http') ? property.images[0] : `${window.location.origin}${property.images[0]}`) : 
        `${window.location.origin}/api/og-image/${property.id}`;
      metaUrl = `${window.location.origin}/properties/${property.id}`;
    }

    // Create and append meta tags
    const metaTags = [
      // Open Graph
      { property: "og:title", content: metaTitle },
      { property: "og:description", content: metaDescription },
      { property: "og:image", content: metaImage },
      { property: "og:url", content: metaUrl },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Spurgeon Property" },
      
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: metaTitle },
      { name: "twitter:description", content: metaDescription },
      { name: "twitter:image", content: metaImage },
      
      // Additional meta tags
      { name: "description", content: metaDescription },
    ];

    metaTags.forEach(tag => {
      if (tag.content) {
        const meta = document.createElement("meta");
        if (tag.property) meta.setAttribute("property", tag.property);
        if (tag.name) meta.setAttribute("name", tag.name);
        meta.setAttribute("content", tag.content);
        document.head.appendChild(meta);
      }
    });

    // Update page title
    if (metaTitle) {
      document.title = `${metaTitle} | Spurgeon Property`;
    }

    // Cleanup function
    return () => {
      const metasToRemove = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
      metasToRemove.forEach(meta => meta.remove());
    };
  }, [property, title, description, image, url]);

  return null; // This component doesn't render anything
}