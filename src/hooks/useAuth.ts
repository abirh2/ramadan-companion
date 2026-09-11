'use client';

import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthProvider';
import { AuthContextType } from '@/types/auth.types';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

/**
 * Reads auth state when it is available without requiring an AuthProvider.
 * Useful for reusable controls whose signed-out behavior is fully functional.
 */
export function useOptionalAuth(): AuthContextType | undefined {
  return useContext(AuthContext);
}
