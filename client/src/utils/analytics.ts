// Google Analytics and performance tracking utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class Analytics {
  private static instance: Analytics;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  initialize(measurementId?: string) {
    if (this.isInitialized || !measurementId) return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });

    this.isInitialized = true;
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title || document.title
    });
  }

  // Track property views
  trackPropertyView(propertyId: number, propertyTitle: string) {
    if (!this.isInitialized) return;

    window.gtag('event', 'view_item', {
      item_id: propertyId,
      item_name: propertyTitle,
      item_category: 'Property',
      value: 1
    });
  }

  // Track search queries
  trackSearch(searchTerm: string, filters: any) {
    if (!this.isInitialized) return;

    window.gtag('event', 'search', {
      search_term: searchTerm,
      property_type: filters.propertyType,
      location: filters.city || filters.province,
      price_range: `${filters.minPrice || 0}-${filters.maxPrice || 'max'}`
    });
  }

  // Track lead generation
  trackLead(propertyId?: number, leadType: string = 'contact') {
    if (!this.isInitialized) return;

    window.gtag('event', 'generate_lead', {
      property_id: propertyId,
      lead_type: leadType,
      value: 1
    });
  }

  // Track user engagement
  trackEngagement(action: string, category: string, label?: string) {
    if (!this.isInitialized) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }

  // Performance tracking
  trackPerformance() {
    if (!this.isInitialized) return;

    // Track Core Web Vitals
    if ('web-vitals' in window) {
      // This would require importing web-vitals library
      // For now, we'll track basic performance metrics
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          window.gtag('event', 'page_load_time', {
            event_category: 'Performance',
            value: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
          });
        }
      });
    }
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();