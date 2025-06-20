// SEO utilities for better search engine optimization

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  structuredData?: object;
}

export function updateSEO(config: SEOConfig) {
  // Update page title
  document.title = config.title;

  // Update or create meta tags
  updateMetaTag('description', config.description);
  
  if (config.keywords) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // Open Graph tags
  updateMetaTag('og:title', config.ogTitle || config.title, 'property');
  updateMetaTag('og:description', config.ogDescription || config.description, 'property');
  updateMetaTag('og:type', 'website', 'property');
  
  if (config.ogImage) {
    updateMetaTag('og:image', config.ogImage, 'property');
  }
  
  if (config.ogUrl) {
    updateMetaTag('og:url', config.ogUrl, 'property');
  }

  // Twitter Cards
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', config.ogTitle || config.title, 'name');
  updateMetaTag('twitter:description', config.ogDescription || config.description, 'name');
  
  if (config.ogImage) {
    updateMetaTag('twitter:image', config.ogImage, 'name');
  }

  // Canonical URL
  if (config.canonical) {
    updateCanonicalLink(config.canonical);
  }

  // Structured data
  if (config.structuredData) {
    updateStructuredData(config.structuredData);
  }
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  
  element.href = href;
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Property-specific SEO data
export function getPropertySEO(property: any): SEOConfig {
  const title = `${property.title} - ${property.city}, ${property.province} | Spurgeon Property`;
  const description = `${property.propertyType} in ${property.city} for R${parseInt(property.price).toLocaleString()}. ${property.bedrooms} bed, ${property.bathrooms} bath. ${property.description?.substring(0, 120)}...`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `${window.location.origin}/property/${property.id}`,
    "image": property.images?.[0] ? `${window.location.origin}${property.images[0]}` : undefined,
    "price": property.price,
    "priceCurrency": "ZAR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "addressRegion": property.province,
      "postalCode": property.postalCode,
      "addressCountry": "ZA"
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined,
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": parseInt(property.bathrooms),
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitCode": "MTK"
    },
    "yearBuilt": property.yearBuilt,
    "propertyType": property.propertyType
  };

  return {
    title,
    description,
    keywords: [
      property.propertyType?.toLowerCase(),
      property.city?.toLowerCase(),
      property.province?.toLowerCase(),
      'south africa property',
      'real estate',
      `${property.bedrooms} bedroom`,
      'property for sale'
    ],
    ogTitle: title,
    ogDescription: description,
    ogImage: property.images?.[0] ? `${window.location.origin}${property.images[0]}` : undefined,
    ogUrl: `${window.location.origin}/property/${property.id}`,
    canonical: `${window.location.origin}/property/${property.id}`,
    structuredData
  };
}

// Homepage SEO
export function getHomepageSEO(): SEOConfig {
  return {
    title: "Spurgeon Property - Premium South African Real Estate | Buy, Sell, Rent",
    description: "Discover premium properties across South Africa with Spurgeon Property. Expert real estate services in Cape Town, Johannesburg, and beyond. Buy, sell, or rent with confidence.",
    keywords: [
      'south africa property',
      'real estate south africa',
      'property for sale',
      'property to rent',
      'cape town property',
      'johannesburg property',
      'spurgeon property',
      'estate agents'
    ],
    ogTitle: "Spurgeon Property - South Africa's Premier Real Estate Platform",
    ogDescription: "Find your dream property in South Africa. Expert agents, premium listings, and comprehensive real estate services.",
    ogUrl: window.location.origin,
    canonical: window.location.origin,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Spurgeon Property",
      "url": window.location.origin,
      "logo": `${window.location.origin}/spurgeon-logo.png`,
      "description": "Premium real estate services across South Africa",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ZA"
      },
      "areaServed": "South Africa",
      "serviceType": ["Property Sales", "Property Rentals", "Property Management"]
    }
  };
}