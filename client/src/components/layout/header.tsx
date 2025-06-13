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
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <Settings className="w-4 h-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <DropdownMenuItem 
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                  {theme === "light" && <span className="ml-auto text-purple-600">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                  {theme === "dark" && <span className="ml-auto text-purple-600">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
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
          
          {/* Mobile Menu - Force visibility with debug styles */}
          <div 
            className="block md:hidden" 
            style={{ 
              position: "relative", 
              zIndex: 50,
              backgroundColor: "red", // Debug: red background to ensure visibility
              padding: "4px",
              borderRadius: "8px"
            }}
          >
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className="relative p-4 bg-white text-black rounded-lg shadow-xl border-4 border-black touch-manipulation min-h-[48px] min-w-[48px] font-bold"
                  style={{ 
                    display: "flex !important", 
                    alignItems: "center", 
                    justifyContent: "center",
                    visibility: "visible !important",
                    opacity: "1 !important",
                    zIndex: 51
                  }}
                >
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90vw] max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 scroll-container">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                      <Logo />
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex-1 py-6 overflow-y-auto scroll-container">
                    <nav className="space-y-2">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <button
                            className={`flex items-center space-x-3 w-full px-4 py-4 text-left rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] ${
                              isActive(item.href)
                                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-l-4 border-purple-600"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="w-6 h-6" />
                            <span className="font-medium text-base">{item.name}</span>
                          </button>
                        </Link>
                      ))}
                    </nav>
                  </div>
                  
                  {/* Theme Settings */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                      Theme Settings
                    </div>
                    
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4"
                        onClick={() => {
                          setTheme("light");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Sun className="w-4 h-4 mr-3" />
                        Light Mode
                        {theme === "light" && <span className="ml-auto text-purple-600">✓</span>}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4"
                        onClick={() => {
                          setTheme("dark");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Moon className="w-4 h-4 mr-3" />
                        Dark Mode
                        {theme === "dark" && <span className="ml-auto text-purple-600">✓</span>}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left px-4"
                        onClick={() => {
                          setTheme("system");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full mr-3" />
                        System Mode
                        {theme === "system" && <span className="ml-auto text-purple-600">✓</span>}
                      </Button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6 pb-4 mt-4">
                    <Button 
                      className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        SpurgeonProperty © 2024
                      </p>
                    </div>
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
