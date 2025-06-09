import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const isAuthenticated = !!user && !error;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && error) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin portal",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  }, [isAuthenticated, isLoading, error, navigate, toast]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}

export function useAdminAuthRedirect() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return { loading: true, authenticated: false };
  }
  
  return { loading: false, authenticated: isAuthenticated };
}