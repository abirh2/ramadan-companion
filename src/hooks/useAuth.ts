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

