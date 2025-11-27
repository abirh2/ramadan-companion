// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Note: Web API polyfills (Request, Response, Headers, TextEncoder, TextDecoder)
// are now in jest.polyfills.js to load before Next.js modules

// =============================================================================
// Capacitor Plugin Mocks
// Default to browser mode (isNativePlatform = false) for all tests
// =============================================================================

// Mock Capacitor core - default to browser mode
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    getPlatform: jest.fn(() => 'web'),
    isPluginAvailable: jest.fn(() => false),
  },
}))

// Mock Capacitor Geolocation plugin
jest.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: jest.fn().mockResolvedValue({ location: 'granted' }),
    requestPermissions: jest.fn().mockResolvedValue({ location: 'granted' }),
    getCurrentPosition: jest.fn().mockResolvedValue({
      coords: {
        latitude: 21.4225,
        longitude: 39.8262,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}))

// Mock Capacitor Motion plugin
jest.mock('@capacitor/motion', () => ({
  Motion: {
    addListener: jest.fn().mockResolvedValue({
      remove: jest.fn().mockResolvedValue(undefined),
    }),
    removeAllListeners: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock Capacitor Haptics plugin
jest.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: jest.fn().mockResolvedValue(undefined),
    notification: jest.fn().mockResolvedValue(undefined),
    vibrate: jest.fn().mockResolvedValue(undefined),
    selectionStart: jest.fn().mockResolvedValue(undefined),
    selectionChanged: jest.fn().mockResolvedValue(undefined),
    selectionEnd: jest.fn().mockResolvedValue(undefined),
  },
  ImpactStyle: {
    Heavy: 'HEAVY',
    Medium: 'MEDIUM',
    Light: 'LIGHT',
  },
  NotificationType: {
    Success: 'SUCCESS',
    Warning: 'WARNING',
    Error: 'ERROR',
  },
}))

// =============================================================================
// Framework Mocks
// =============================================================================

// Mock next-themes for tests
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark'],
  }),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase clients to avoid initialization in tests
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
  })),
}))

// Mock the legacy supabaseClient to prevent initialization errors
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

