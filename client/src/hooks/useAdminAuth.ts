import { useQuery } from "@tanstack/react-query";

interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export function useAdminAuth() {
  const { data: user, isLoading, error } = useQuery<AdminUser>({
    queryKey: ["/api/admin/profile"],
    retry: false,
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}