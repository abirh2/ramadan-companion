/**
 * Accessibility Utilities
 * 
 * Provides reusable accessibility patterns and utilities for ARIA labels,
 * screen reader announcements, and keyboard navigation throughout the app.
 */

/**
 * Generate a descriptive ARIA label by combining context and details
 * 
 * @example
 * generateAriaLabel('Next Prayer', 'Asr in 2 hours 15 minutes')
 * // Returns: "Next Prayer: Asr in 2 hours 15 minutes"
 */
export function generateAriaLabel(context: string, details: string): string {
  return `${context}: ${details}`
}

/**
 * Generate an ARIA label for a card with title and description
 * 
 * @example
 * generateCardAriaLabel('Prayer Times', 'View today\'s prayer schedule')
 * // Returns: "Prayer Times card. View today's prayer schedule"
 */
export function generateCardAriaLabel(title: string, description?: string): string {
  if (description) {
    return `${title} card. ${description}`
  }
  return `${title} card`
}

/**
 * Generate an ARIA label for loading states
 */
export function generateLoadingLabel(context: string): string {
  return `Loading ${context}...`
}

/**
 * Generate an ARIA label for error states
 */
export function generateErrorLabel(context: string): string {
  return `Error loading ${context}. Please try again.`
}

/**
 * Format a countdown for screen readers
 * Converts "2:15:30" to "2 hours, 15 minutes, 30 seconds"
 */
export function formatCountdownForScreenReader(countdown: string): string {
  const parts = countdown.split(':')
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(p => parseInt(p, 10))
    const hourText = hours === 1 ? 'hour' : 'hours'
    const minuteText = minutes === 1 ? 'minute' : 'minutes'
    const secondText = seconds === 1 ? 'second' : 'seconds'
    
    if (hours > 0) {
      return `${hours} ${hourText}, ${minutes} ${minuteText}, ${seconds} ${secondText}`
    } else if (minutes > 0) {
      return `${minutes} ${minuteText}, ${seconds} ${secondText}`
    } else {
      return `${seconds} ${secondText}`
    }
  }
  
  if (parts.length === 2) {
    const [minutes, seconds] = parts.map(p => parseInt(p, 10))
    const minuteText = minutes === 1 ? 'minute' : 'minutes'
    const secondText = seconds === 1 ? 'second' : 'seconds'
    
    if (minutes > 0) {
      return `${minutes} ${minuteText}, ${seconds} ${secondText}`
    } else {
      return `${seconds} ${secondText}`
    }
  }
  
  return countdown
}

/**
 * Generate keyboard shortcut hint text
 */
export function generateKeyboardHint(key: string, action: string): string {
  return `Press ${key} to ${action}`
}

/**
 * Check if an element should handle keyboard event
 * Prevents conflicts with native inputs
 */
export function shouldHandleKeyboardEvent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement
  const tagName = target.tagName.toLowerCase()
  
  // Don't handle keyboard events in inputs, textareas, or contenteditable
  if (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  ) {
    return false
  }
  
  return true
}

/**
 * Get human-readable key name for display
 */
export function getKeyDisplayName(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Tab': 'Tab',
  }
  
  return keyMap[key] || key.toUpperCase()
}

/**
 * Announce a message to screen readers via live region
 * Note: This function requires a live region to be present in the DOM
 * Use with the useAnnouncer hook for best results
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create live region
  let liveRegion = document.getElementById(`aria-live-${priority}`)
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = `aria-live-${priority}`
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
  }
  
  // Clear and set message with slight delay to ensure announcement
  liveRegion.textContent = ''
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message
    }
  }, 100)
}

/**
 * Focus trap utility for modals and dialogs
 * Returns cleanup function
 */
export function trapFocus(containerElement: HTMLElement): () => void {
  const focusableElements = containerElement.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }
  
  containerElement.addEventListener('keydown', handleKeyDown)
  
  // Focus first element on mount
  firstElement?.focus()
  
  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleKeyDown)
  }
}

