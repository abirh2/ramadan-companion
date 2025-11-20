'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Heart } from 'lucide-react';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleFavorites = () => {
    router.push('/favorites');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const showEmail = profile?.display_name && user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          aria-label={`User menu for ${displayName}`}
          title="Open user menu"
        >
          <User className="h-4 w-4" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" aria-label="User menu">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {showEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleFavorites} role="menuitem">
          <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleProfile} role="menuitem">
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive" role="menuitem">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

