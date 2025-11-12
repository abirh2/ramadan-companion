'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowLoginModal(true)}>
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

