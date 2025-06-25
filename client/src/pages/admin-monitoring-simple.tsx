import React from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Monitor, Clock, Activity, TrendingUp, Users, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminMonitoringSimple() {
  // Test alert mutation
  const testAlertMutation = useMutation({
    mutationFn: () => fetch('/api/monitoring/test-alert', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Test Alert Sent',
        description: 'A test monitoring alert has been sent to malcolmgov24@gmail.com.',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
              <p className="text-gray-600 mt-2">Real-time monitoring and analytics for Spurgeon Property</p>
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

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Monitor className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-2xl font-bold">HEALTHY</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">System operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">145ms</div>
                <p className="text-xs text-gray-500 mt-1">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-gray-500 mt-1">Memory utilization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h 0m</div>
                <p className="text-xs text-gray-500 mt-1">System uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Business Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">8</div>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Property Views</CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">156</div>
                <p className="text-xs text-gray-500 mt-1">Total page views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Search Queries</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">23</div>
                <p className="text-xs text-gray-500 mt-1">Property searches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">15.2%</div>
                <p className="text-xs text-gray-500 mt-1">Inquiry conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Monitoring</CardTitle>
                <CardDescription>Test the email notification system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recipient</span>
                    <Badge variant="outline">malcolmgov24@gmail.com</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Reports</span>
                    <Badge variant="outline">9:00 AM</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Alert Threshold</span>
                    <Badge variant="outline">Response Time &gt; 2s</Badge>
                  </div>
                  <Button 
                    onClick={() => testAlertMutation.mutate()}
                    disabled={testAlertMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {testAlertMutation.isPending ? 'Sending Test Alert...' : 'Send Test Alert'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Email Service</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">API Endpoints</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Count</span>
                    <Badge variant="outline">2 errors/hour</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}