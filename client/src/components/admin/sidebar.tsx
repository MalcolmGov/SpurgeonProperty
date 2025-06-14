import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, BarChart3, Building, Users, UserCheck, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";

export default function AdminSidebar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path || location.startsWith(path);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3, exact: true },
    { name: "Properties", href: "/admin/properties", icon: Building },
    { name: "Leads", href: "/admin/leads", icon: Users },
    { name: "Agents", href: "/admin/agents", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-3 mb-8">
          <Logo variant="compact" showText={false} />
          <div>
            <span className="text-lg font-bold text-slate-800 dark:text-white block">SpurgeonProperty</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">Admin Portal</span>
          </div>
        </Link>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const active = item.exact ? location === item.href : isActive(item.href);
            
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] ${
                    active
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={onNavigate}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>
        
        {/* Back to Main Site */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link href="/">
            <button 
              className="flex items-center space-x-3 w-full px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation min-h-[48px]"
              onClick={onNavigate}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Back to Site</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="p-3 bg-white dark:bg-slate-800 shadow-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-purple-900 hover:border-purple-300 dark:hover:border-purple-600 rounded-lg touch-manipulation min-h-[48px] min-w-[48px]"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Open admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-white dark:bg-slate-800">
            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white dark:bg-slate-800 shadow-lg min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </div>
    </>
  );
}
