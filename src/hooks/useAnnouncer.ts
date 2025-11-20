/**
 * useAnnouncer Hook
 * 
 * Provides a simple interface for announcing messages to screen readers
 * via ARIA live regions. Handles creation and management of live regions.
 * 
 * @example
 * const { announce } = useAnnouncer()
 * 
 * // Polite announcement (doesn't interrupt)
 * announce('Prayer time updated')
 * 
 * // Assertive announcement (interrupts current speech)
 * announce('Error: Unable to save donation', 'assertive')
 */

import { useCallback, useEffect } from 'react'

type AnnouncePriority = 'polite' | 'assertive'

interface AnnouncerOptions {
  /**
   * Clear previous announcement before making new one
   * Default: true
   */
  clearPrevious?: boolean
  
  /**
   * Delay before announcing (ms)
   * Useful for ensuring DOM updates complete first
   * Default: 100
   */
  delay?: number
}

export function useAnnouncer() {
  // Ensure live regions exist
  useEffect(() => {
    // Create polite live region if it doesn't exist
    if (!document.getElementById('aria-live-polite')) {
      const politeRegion = document.createElement('div')
      politeRegion.id = 'aria-live-polite'
      politeRegion.setAttribute('aria-live', 'polite')
      politeRegion.setAttribute('aria-atomic', 'true')
      politeRegion.className = 'sr-only'
      document.body.appendChild(politeRegion)
    }
    
    // Create assertive live region if it doesn't exist
    if (!document.getElementById('aria-live-assertive')) {
      const assertiveRegion = document.createElement('div')
      assertiveRegion.id = 'aria-live-assertive'
      assertiveRegion.setAttribute('aria-live', 'assertive')
      assertiveRegion.setAttribute('aria-atomic', 'true')
      assertiveRegion.className = 'sr-only'
      document.body.appendChild(assertiveRegion)
    }
  }, [])
  
  /**
   * Announce a message to screen readers
   */
  const announce = useCallback(
    (
      message: string,
      priority: AnnouncePriority = 'polite',
      options: AnnouncerOptions = {}
    ) => {
      const { clearPrevious = true, delay = 100 } = options
      
      const liveRegion = document.getElementById(`aria-live-${priority}`)
      
      if (!liveRegion) {
        console.warn(`[useAnnouncer] Live region for ${priority} not found`)
        return
      }
      
      // Clear previous message if requested
      if (clearPrevious) {
        liveRegion.textContent = ''
      }
      
      // Announce with delay to ensure screen readers pick it up
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = message
        }
      }, delay)
    },
    []
  )
  
  /**
   * Clear all announcements
   */
  const clear = useCallback(() => {
    const politeRegion = document.getElementById('aria-live-polite')
    const assertiveRegion = document.getElementById('aria-live-assertive')
    
    if (politeRegion) politeRegion.textContent = ''
    if (assertiveRegion) assertiveRegion.textContent = ''
  }, [])
  
  return { announce, clear }
}

