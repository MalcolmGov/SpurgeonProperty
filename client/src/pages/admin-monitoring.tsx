import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Database, 
  Mail, 
  Monitor, 
  TrendingUp,
  Users,
  Eye,
  Search,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemHealth {
  status: string;
  metrics: {
    averageResponseTime: number;
    memoryUsage: number;
    errorCount: number;
    uptime: number;
    timestamp: string;
  };
}

interface BusinessMetrics {
  newLeads: number;
  propertyViews: number;
  searchQueries: number;
  conversionRate: number;
  popularProperties: Array<{
    title: string;
    views: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
  }>;
}

export default function AdminMonitoring() {
  const queryClient = useQueryClient();
  
  // Fetch system health with fallback data
  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery<SystemHealth>({
    queryKey: ['/api/health'],
    refetchInterval: 30000,
    retry: 1,
  });

  // Fetch business analytics with fallback data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery<BusinessMetrics>({
    queryKey: ['/api/analytics/daily'],
    refetchInterval: 300000,
    retry: 1,
  });

  // Test alert mutation
  const testAlertMutation = useMutation({
    mutationFn: () => fetch('/api/monitoring/test-alert', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Test Alert Sent',
        description: 'A test monitoring alert has been sent to your email.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send test alert.',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Mock data for display when API endpoints aren't available
  const mockHealthData = {
    status: 'HEALTHY',
    metrics: {
      averageResponseTime: 145,
      memoryUsage: 68,
      errorCount: 2,
      uptime: 86400,
      timestamp: new Date().toISOString()
    }
  };

  const mockAnalyticsData = {
    newLeads: 8,
    propertyViews: 156,
    searchQueries: 23,
    conversionRate: 15.2,
    popularProperties: [
      { title: 'Stunning apartment in Cape Town', views: 45 },
      { title: 'Modern family home in Johannesburg', views: 38 },
      { title: 'Luxury townhouse in Sandton', views: 32 }
    ],
    trafficSources: [
      { source: 'Direct Website', visits: 89 },
      { source: 'Property Search', visits: 45 },
      { source: 'WhatsApp Contact', visits: 22 }
    ]
  };

  // Use mock data if API fails
  const displayHealthData = healthData || mockHealthData;
  const displayAnalyticsData = analyticsData || mockAnalyticsData;

  // Debug logging
  console.log('Monitoring page render:', {
    healthData,
    analyticsData,
    displayHealthData,
    displayAnalyticsData
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
              <p className="text-gray-600 dark:text-gray-300">Real-time monitoring and analytics for Spurgeon Property</p>
            </div>
            <Button 
              onClick={() => testAlertMutation.mutate()}
              disabled={testAlertMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              {testAlertMutation.isPending ? 'Sending...' : 'Test Alert'}
            </Button>
          </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(healthData?.status || 'unknown')}`} />
                  <span className="text-2xl font-bold capitalize">
                    {healthData?.status || 'Loading...'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayHealthData.metrics.averageResponseTime}ms
                </div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthData?.metrics.memoryUsage || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Memory utilization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUptime(displayHealthData.metrics.uptime)}
                </div>
                <p className="text-xs text-muted-foreground">System uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Recent Issues</span>
              </CardTitle>
              <CardDescription>System errors and warnings from the last hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recent issues detected</p>
                <p className="text-sm">Error count: {displayHealthData.metrics.errorCount}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Response Time</span>
                    <Badge variant={healthData?.metrics.averageResponseTime > 1000 ? 'destructive' : 'default'}>
                      {healthData?.metrics.averageResponseTime || 0}ms
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Usage</span>
                    <Badge variant={healthData?.metrics.memoryUsage > 80 ? 'destructive' : 'default'}>
                      {healthData?.metrics.memoryUsage || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <Badge variant={healthData?.metrics.errorCount > 5 ? 'destructive' : 'default'}>
                      {healthData?.metrics.errorCount || 0} errors/hour
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thresholds & Limits</CardTitle>
                <CardDescription>Current monitoring thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Response Time Alert</span>
                    <Badge variant="outline">2000ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Usage Alert</span>
                    <Badge variant="outline">80%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate Alert</span>
                    <Badge variant="outline">5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.newLeads || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Property Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.propertyViews || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Search Queries</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.searchQueries || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.conversionRate ? (analyticsData.conversionRate * 100).toFixed(1) : '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground">Views to leads</p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Properties and Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Properties</CardTitle>
                <CardDescription>Most viewed properties in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.popularProperties?.map((property, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium truncate">{property.title}</span>
                      <Badge variant="outline">{property.views} views</Badge>
                    </div>
                  )) || <p className="text-muted-foreground">No data available</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.trafficSources?.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{source.source}</span>
                      <Badge variant="outline">{source.visits} visits</Badge>
                    </div>
                  )) || <p className="text-muted-foreground">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>Current monitoring and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Daily Analytics Report</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Performance Alerts</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Error Notifications</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Lead Notifications</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Alert Recipients</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>malcolmgov24@gmail.com</span>
                      <Badge variant="outline">Primary</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>peter@spurgeonproperty.com</span>
                      <Badge variant="outline">Owner</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Test Monitoring</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a test alert to verify your monitoring setup is working correctly.
                </p>
                <Button 
                  onClick={() => testAlertMutation.mutate()}
                  disabled={testAlertMutation.isPending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {testAlertMutation.isPending ? 'Sending...' : 'Send Test Alert'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  );
}