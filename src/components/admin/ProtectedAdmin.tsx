/**
 * Protected admin wrapper component
 * Shows content only if user is an admin
 * Displays 403 message for non-admin users
 */

'use client'

import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { ShieldAlert } from 'lucide-react'

interface ProtectedAdminProps {
  children: React.ReactNode
}

/**
 * Wrapper component for admin-only features
 * 
 * @example
 * <ProtectedAdmin>
 *   <AdminDashboard />
 * </ProtectedAdmin>
 */
export function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const { isAdmin, loading } = useAdmin()

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-muted-foreground">
            You do not have permission to access this page. This area is restricted to
            administrators only.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  // Authorized - show admin content
  return <>{children}</>
}

