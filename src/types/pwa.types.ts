// PWA Type Definitions

/**
 * BeforeInstallPromptEvent interface
 * Extends Event to include prompt() method for triggering install dialog
 */
export interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns a Promise that resolves when the user makes a choice
   */
  readonly prompt: () => Promise<void>;
  
  /**
   * Returns a Promise that resolves with user's choice
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

/**
 * Install prompt state management
 */
export interface InstallPromptState {
  /** Whether the app is installable (beforeinstallprompt event fired) */
  isInstallable: boolean;
  
  /** Whether the app is already installed (standalone mode) */
  isInstalled: boolean;
  
  /** Whether the prompt has been dismissed by user */
  isDismissed: boolean;
  
  /** Timestamp when prompt was last dismissed */
  dismissedAt: number | null;
  
  /** Number of page views (engagement tracking) */
  pageViews: number;
  
  /** Whether user has enabled location (engagement indicator) */
  hasEnabledLocation: boolean;
}

/**
 * Service Worker registration state
 */
export interface ServiceWorkerState {
  /** Whether service worker is supported */
  isSupported: boolean;
  
  /** Whether service worker is registered */
  isRegistered: boolean;
  
  /** Service worker registration object */
  registration: ServiceWorkerRegistration | null;
  
  /** Registration error if any */
  error: Error | null;
}

/**
 * PWA display mode detection
 */
export type DisplayMode = 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';

/**
 * Cache strategy types
 */
export type CacheStrategy = 'cache-first' | 'network-first' | 'cache-only' | 'network-only';

/**
 * LocalStorage keys for PWA features
 */
export const PWA_STORAGE_KEYS = {
  INSTALL_PROMPT_DISMISSED: 'installPromptDismissed',
  INSTALL_PROMPT_DISMISSED_AT: 'installPromptDismissedAt',
  PAGE_VIEW_COUNT: 'pageViewCount',
  LOCATION_ENABLED: 'locationEnabled',
} as const;

/**
 * Install prompt dismissal duration (7 days in milliseconds)
 */
export const INSTALL_PROMPT_DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Minimum page views before showing install prompt
 */
export const MIN_PAGE_VIEWS_FOR_PROMPT = 2;

/**
 * Notification types for future implementation
 */
export type NotificationType = 'prayer' | 'ramadan' | 'charity' | 'general';

/**
 * Notification permission state
 */
export type NotificationPermissionState = 'default' | 'granted' | 'denied';

/**
 * Prayer notification preferences (for future implementation)
 */
export interface PrayerNotificationPreferences {
  enabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  minutesBefore: number; // Notify X minutes before prayer time
  sound: boolean;
  vibrate: boolean;
}

/**
 * Helper type for Window interface extension
 */
declare global {
  interface Window {
    /** BeforeInstallPrompt event (for PWA install prompt) */
    deferredPrompt?: BeforeInstallPromptEvent;
  }
  
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export {};

