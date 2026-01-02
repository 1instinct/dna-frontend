import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@config/auth";
import { Loading } from "@components/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Client-side route protection component
 * Use this to wrap page components that require authentication
 *
 * Example usage:
 * ```tsx
 * const AccountPage = () => {
 *   return (
 *     <ProtectedRoute>
 *       <div>Protected account content</div>
 *     </ProtectedRoute>
 *   );
 * };
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login"
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is loaded
    if (user === undefined) {
      // Still loading
      return;
    }

    setIsChecking(false);

    if (!user) {
      // Not authenticated, redirect to login
      router.push(`${redirectTo}?redirect=${router.asPath}`);
    }
  }, [user, router, redirectTo]);

  // Show loading while checking authentication
  if (isChecking || user === undefined) {
    return <Loading />;
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};
