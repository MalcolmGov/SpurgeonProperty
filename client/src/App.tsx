import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "next-themes";
import Home from "@/pages/home";
import About from "@/pages/about";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import MapPage from "@/pages/map";
import SellProperty from "@/pages/sell-property";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProperties from "@/pages/admin/properties";
import AdminLeads from "@/pages/admin/leads";
import AdminAITools from "@/pages/admin-ai-tools";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin/ai-tools" component={AdminAITools} />
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/properties" component={Properties} />
      <Route path="/about" component={About} />
      <Route path="/sell-property" component={SellProperty} />
      <Route path="/map" component={MapPage} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
