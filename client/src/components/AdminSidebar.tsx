import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BarChart3, Building, Users, UserRoundCheck, TrendingUp, Sparkles } from "lucide-react";

const navigationItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/properties", label: "Properties", icon: Building },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/agents", label: "Agents", icon: UserRoundCheck },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/ai-tools", label: "AI Tools", icon: Sparkles },
];

export default function AdminSidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <div className="w-64 bg-card shadow-lg min-h-screen border-r border-border">
      <div className="p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 gradient-purple-orange rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Admin Portal</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Back to Main Site */}
        <div className="mt-8 pt-8 border-t border-border">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Main Site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
