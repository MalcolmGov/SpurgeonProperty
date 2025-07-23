import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import { CatalogueGenerator } from "@/components/admin/catalogue-generator";

export default function AdminCatalogue() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Simple authentication check using direct API call
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = '/admin/login';
        }
      } catch (error) {
        setIsAuthenticated(false);
        window.location.href = '/admin/login';
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <CatalogueGenerator />
        </div>
      </div>
    </div>
  );
}