import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProperties from "@/pages/admin/properties";
import AdminLeads from "@/pages/admin/leads";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/properties" component={Properties} />
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
