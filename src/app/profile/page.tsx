'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Bell, BellOff, Check, ExternalLink } from 'lucide-react';
import { FeedbackButton } from '@/components/FeedbackButton';
import { useNotifications } from '@/hooks/useNotifications';
import type { PrayerName } from '@/types/notification.types';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { preferences, isSupported } = useNotifications();

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          display_name: displayName || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Update your profile settings and preferences</p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your profile settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-green-600' : 'text-destructive'
                  }`}
                >
                  {message.text}
                </p>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences Summary */}
        {isSupported && preferences.enabled && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <Link href="/times">
                  <Button variant="ghost" size="sm">
                    Manage
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Your prayer time notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Notifications are enabled
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Enabled Prayers:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(preferences.prayers) as [PrayerName, boolean][]).map(
                      ([prayer, enabled]) =>
                        enabled && (
                          <div
                            key={prayer}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-primary" />
                            <span>{prayer}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  You'll receive notifications at exact prayer times with
                  motivational reminders from authentic hadith.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show disabled state if supported but not enabled */}
        {isSupported && !preferences.enabled && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BellOff className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Prayer time notifications are currently disabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/times">
                <Button variant="outline" size="sm">
                  Enable Notifications
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback Button */}
      <FeedbackButton pagePath="/profile" />
    </div>
  );
}

