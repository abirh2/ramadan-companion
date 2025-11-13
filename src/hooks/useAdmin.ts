/**
 * Admin detection hook
 * Returns admin status from authenticated user's profile
 */

import { useAuth } from './useAuth'

export interface UseAdminResult {
  isAdmin: boolean
  loading: boolean
}

/**
 * Hook to check if current user is an admin
 * 
 * @returns Object with isAdmin boolean and loading state
 * 
 * @example
 * const { isAdmin, loading } = useAdmin()
 * if (loading) return <Spinner />
 * if (!isAdmin) return <Forbidden />
 * return <AdminDashboard />
 */
export function useAdmin(): UseAdminResult {
  const { profile, loading } = useAuth()

  return {
    isAdmin: profile?.is_admin === true,
    loading,
  }
}

