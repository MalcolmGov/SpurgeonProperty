import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export function useAdminAuth() {
  const [location, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<AdminUser>({
    queryKey: ["/api/admin/profile"],
    retry: false,
  });

  const isAuthenticated = !!user;

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.startsWith('/admin/login')) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}