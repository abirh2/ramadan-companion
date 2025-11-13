import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type User = SupabaseUser;
export type Session = SupabaseSession;

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  display_name?: string;
  timezone?: string;
  location_type?: 'coords' | 'city';
  location_lat?: number;
  location_lng?: number;
  location_city?: string;
  calculation_method?: string;
  madhab?: string;
  hijri_offset_days?: number;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  quran_translation?: string;
  hadith_language?: string;
  distance_unit?: string;
  is_admin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

