import { Link, useLocation } from "wouter";
import { Home, BarChart3, Building, Users, UserCheck, Settings } from "lucide-react";

export default function AdminSidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path || location.startsWith(path);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3, exact: true },
    { name: "Properties", href: "/admin/properties", icon: Building },
    { name: "Leads", href: "/admin/leads", icon: Users },
    { name: "Agents", href: "/admin/agents", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-800 shadow-lg min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 gradient-purple-orange rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">Admin Portal</span>
        </Link>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const active = item.exact ? location === item.href : isActive(item.href);
            
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-primary"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>
        
        {/* Back to Main Site */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link href="/">
            <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Home className="w-5 h-5" />
              <span>Back to Site</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
