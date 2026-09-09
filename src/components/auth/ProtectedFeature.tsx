'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { LoginModal } from './LoginModal';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedFeature({ 
  children, 
  title = 'Authentication Required',
  description = 'Please sign in to access this feature'
}: ProtectedFeatureProps) {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <Card variant="grouped">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <>
        <Card variant="grouped" className="gap-0 py-0">
          <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <Lock className="size-5 shrink-0 text-text-secondary" strokeWidth={1.8} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="type-body font-semibold text-text-primary">{title}</h2>
              <p className="type-body-secondary mt-1 text-text-secondary">{description}</p>
            </div>
            <Button onClick={() => setShowLoginModal(true)} size="sm" className="shrink-0">
              Sign In
            </Button>
          </CardContent>
        </Card>
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
        />
      </>
    );
  }

  return <>{children}</>;
}
