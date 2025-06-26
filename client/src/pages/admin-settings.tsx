import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Building, Mail, Globe, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved successfully",
      description: "Your configuration has been updated."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-purple-600" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your admin portal and platform settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                defaultValue="Spurgeon Property" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input 
                id="company-phone" 
                defaultValue="+27 21 xxx xxxx" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company-email">Contact Email</Label>
              <Input 
                id="company-email" 
                defaultValue="info@spurgeonproperty.com" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company-address">Address</Label>
              <Textarea 
                id="company-address" 
                defaultValue="Cape Town, South Africa"
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-name">Display Name</Label>
              <Input 
                id="admin-name" 
                defaultValue="Admin User" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email Address</Label>
              <Input 
                id="admin-email" 
                defaultValue="admin@spurgeonproperty.com" 
                className="mt-1"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="admin-role">Role</Label>
              <Input 
                id="admin-role" 
                defaultValue="Administrator" 
                className="mt-1"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Lead Notifications</Label>
                <p className="text-sm text-gray-500">Get notified when new leads are submitted</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Property Inquiries</Label>
                <p className="text-sm text-gray-500">Notifications for property-specific inquiries</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>System Alerts</Label>
                <p className="text-sm text-gray-500">Important system and security notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-gray-500">Weekly performance and analytics reports</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Property Auto-Approval</Label>
                <p className="text-sm text-gray-500">Automatically approve new property listings</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Lead Auto-Assignment</Label>
                <p className="text-sm text-gray-500">Automatically assign leads to available agents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Put website in maintenance mode</p>
              </div>
              <Switch />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                defaultValue="Africa/Johannesburg" 
                className="mt-1"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add extra security to your account</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Authorized Admin Emails</h4>
              <div className="space-y-1 text-sm text-yellow-700">
                <p>• peter@spurgeonproperty.com</p>
                <p>• veruschkia@spurgeonproperty.com</p>
                <p>• reshma.kila@evogroup.co.za</p>
                <p>• malcolmgov24@gmail.com</p>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Only these email addresses can access the admin portal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}