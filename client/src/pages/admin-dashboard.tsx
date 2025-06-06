import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Home, Users, DollarSign, ChevronUp, Eye, Plus } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
import NotificationPanel from "@/components/NotificationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: recentProperties } = useQuery({
    queryKey: ["/api/properties"],
    select: (data) => data?.properties?.slice(0, 5) || [],
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads"],
    select: (data) => data?.slice(0, 5) || [],
  });

  return (
    <div className="pt-16 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back! Here's what's happening with your properties.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationPanel />
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Properties"
              value={stats?.totalProperties?.toString() || "0"}
              icon={Home}
              trend={{ value: 12, isPositive: true }}
              loading={isLoading}
            />
            <StatsCard
              title="Active Leads"
              value={stats?.activeLeads?.toString() || "0"}
              icon={Users}
              trend={{ value: 24, isPositive: true }}
              loading={isLoading}
            />
            <StatsCard
              title="Total Views"
              value={stats?.totalViews?.toString() || "0"}
              icon={Eye}
              trend={{ value: 18, isPositive: true }}
              loading={isLoading}
            />
            <StatsCard
              title="Conversion Rate"
              value={`${stats?.conversionRate || 0}%`}
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
              loading={isLoading}
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Performance</CardTitle>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-32">
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
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                    <p>Chart visualization would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProperties?.map((property) => (
                    <div key={property.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          New property listed: <span className="font-medium">{property.title}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {recentLeads?.map((lead) => (
                    <div key={lead.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          New lead from <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!recentProperties?.length && !recentLeads?.length) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Property
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties?.map((property) => (
                      <tr key={property.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop"}
                              alt={property.title}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {property.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {property.city}, {property.state}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`status-${property.status}`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          ${Number(property.price).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {property.viewCount || 0}
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
