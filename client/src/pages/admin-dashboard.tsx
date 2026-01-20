import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Home, Users, Banknote, ChevronUp, Eye, Plus } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
import NotificationPanel from "@/components/NotificationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Simple authentication check using direct API call
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = '/admin/login';
        }
      } catch (error) {
        setIsAuthenticated(false);
        window.location.href = '/admin/login';
      }
    };
    
    checkAuth();
  }, []);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: isAuthenticated === true,
  });

  const { data: recentProperties } = useQuery({
    queryKey: ["/api/properties"],
    select: (data: any[]) => Array.isArray(data) ? data.slice(0, 5) : [],
    enabled: isAuthenticated === true,
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads"],
    select: (data: any[]) => Array.isArray(data) ? data.slice(0, 5) : [],
    enabled: isAuthenticated === true,
  });

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Welcome back! Here's what's happening with your properties.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <NotificationPanel />
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Properties"
              value={isLoading ? "..." : ((stats as any)?.activeProperties?.toString() || "0")}
              change=""
              icon={Home}
              trend="neutral"
            />
            <StatsCard
              title="Total Leads"
              value={isLoading ? "..." : ((stats as any)?.totalLeads?.toString() || "0")}
              change=""
              icon={Users}
              trend="neutral"
            />
            <StatsCard
              title="New Leads"
              value={isLoading ? "..." : ((stats as any)?.newLeads?.toString() || "0")}
              change=""
              icon={Eye}
              trend="neutral"
            />
            <StatsCard
              title="Active Agents"
              value={isLoading ? "..." : ((stats as any)?.totalAgents?.toString() || "0")}
              change=""
              icon={TrendingUp}
              trend="neutral"
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Performance Chart */}
            <Card className="w-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg font-semibold">Sales Performance</CardTitle>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 text-center px-4">
                    <TrendingUp className="mx-auto h-8 sm:h-12 w-8 sm:w-12 mb-2 sm:mb-4" />
                    <p className="text-sm sm:text-base">Chart visualization would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
                  {recentProperties?.map((property: any) => (
                    <div key={property.id} className="flex items-start space-x-3 p-2 sm:p-0">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          New property listed: <span className="font-medium">{property.title}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {recentLeads?.map((lead: any) => (
                    <div key={lead.id} className="flex items-start space-x-3 p-2 sm:p-0">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          New lead from <span className="font-medium">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim()}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!recentProperties?.length && !recentLeads?.length) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm sm:text-base">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties Table */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Properties</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">
                        Property
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">
                        Price
                      </th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties?.map((property: any) => (
                      <tr key={property.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop"}
                              alt={property.title}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                {property.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {property.city}, {property.province}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <Badge className={`status-${property.status} text-xs`}>
                            {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">
                          R{property.price || '0'}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-500 dark:text-gray-400 text-sm">
                          {property.views || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
