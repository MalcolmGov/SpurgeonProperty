import React, { useEffect, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "@/contexts/theme-context";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Properties from "@/pages/properties";
import Services from "@/pages/services";
import Rentals from "@/pages/rentals";
import PropertyDetail from "@/pages/property-detail";
import MapPage from "@/pages/map";
import SellProperty from "@/pages/sell-property";
import SimpleAdminLogin from "@/pages/simple-admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProperties from "@/pages/admin/properties";
import AdminLeads from "@/pages/admin/leads-mobile";
import AdminAgents from "@/pages/admin-agents";
import AdminAITools from "@/pages/admin-ai-tools";
import AdminSocialAdsSimple from "@/pages/admin-social-ads-simple";
import AdminSettings from "@/pages/admin-settings";
import AdminCatalogue from "@/pages/admin-catalogue";
import { SocialMediaGenerator } from '@/components/admin/social-media-generator';
import NotFound from "@/pages/not-found";

const AdminMonitoring = lazy(() => import("@/pages/admin-monitoring-simple"));

function Router() {
  const [location] = useLocation();

  // Scroll to top whenever route changes
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/admin/login" component={SimpleAdminLogin} />
      <Route path="/admin/ai-tools" component={AdminAITools} />
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/admin/agents" component={AdminAgents} />
      <Route path="/admin/monitoring" component={AdminMonitoring} />
      <Route path="/admin/social-ads" component={AdminSocialAdsSimple} />
      <Route path="/admin/catalogue" component={AdminCatalogue} />
      <Route path="/admin/social-media" component={() => <SocialMediaGenerator />} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/properties" component={Properties} />
      <Route path="/services" component={Services} />
      <Route path="/rentals" component={Rentals} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/sell-property" component={SellProperty} />
      <Route path="/map" component={MapPage} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Ensure page starts at top on initial load
  useEffect(() => {
    // Immediate scroll reset
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Prevent browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
