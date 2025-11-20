'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { useState } from 'react';
import { LoginModal } from './LoginModal';

export function AuthButton() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <div 
        className="h-10 w-20 animate-pulse rounded bg-muted" 
        role="status"
        aria-label="Loading authentication status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <>
      <Button
        onClick={() => setShowLoginModal(true)}
        variant="default"
        size="sm"
        aria-label="Sign in to your account"
      >
        Login
      </Button>
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </>
  );
}

