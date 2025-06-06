import AdminSidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Building, Users, DollarSign, TrendingUp, Bell } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads"],
    select: (data) => data?.slice(0, 5) || [],
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-purple-primary transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-primary text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-700 h-6 rounded mb-4" />
                  <div className="bg-slate-200 dark:bg-slate-700 h-8 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Properties"
                value={stats?.totalProperties || 0}
                change="+12%"
                icon={Building}
                trend="up"
              />
              <StatsCard
                title="Active Leads"
                value={stats?.newLeads || 0}
                change="+24%"
                icon={Users}
                trend="up"
              />
              <StatsCard
                title="This Month"
                value="$2.4M"
                change="+18%"
                icon={DollarSign}
                trend="up"
              />
              <StatsCard
                title="Conversion Rate"
                value="3.2%"
                change="+5%"
                icon={TrendingUp}
                trend="up"
              />
            </div>
          )}
          
          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Sales Performance
                  <select className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 bg-background">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-slate-400 dark:text-slate-600 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p>Chart visualization would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads?.map((lead) => (
                    <div key={lead.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 dark:text-white font-medium">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {lead.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!recentLeads || recentLeads.length === 0) && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                      <Users className="w-12 h-12 mx-auto mb-4" />
                      <p>No recent leads</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
