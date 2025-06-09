import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Building, Users, MapPin, Sun, Moon, Menu, Settings } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location === path;

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Properties", href: "/properties", icon: Building },
    { name: "Admin", href: "/admin", icon: Users },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <button
                  className={`text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
                    isActive(item.href) ? "text-purple-600 font-medium" : ""
                  }`}
                >
                  {item.name}
                </button>
              </Link>
            ))}
            
            {/* Settings Menu with Theme Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Settings className="w-4 h-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                  {theme === "light" && <span className="ml-auto text-purple-600">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                  {theme === "dark" && <span className="ml-auto text-purple-600">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full" />
                  <span>System Mode</span>
                  {theme === "system" && <span className="ml-auto text-purple-600">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Sign In
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <button
                        className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-primary"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </button>
                    </Link>
                  ))}
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Theme Settings
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="w-4 h-4 mr-3" />
                      Light Mode
                      {theme === "light" && <span className="ml-auto text-purple-600">✓</span>}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="w-4 h-4 mr-3" />
                      Dark Mode
                      {theme === "dark" && <span className="ml-auto text-purple-600">✓</span>}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setTheme("system")}
                    >
                      <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full mr-3" />
                      System Mode
                      {theme === "system" && <span className="ml-auto text-purple-600">✓</span>}
                    </Button>
                    
                    <Button className="w-full mt-4 bg-purple-primary hover:bg-purple-secondary text-white">
                      Sign In
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
