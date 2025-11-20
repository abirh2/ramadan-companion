/**
 * SkipLink Component
 * 
 * Provides a "skip to main content" link that appears when focused via keyboard.
 * Essential for accessibility - allows keyboard users to bypass repetitive navigation.
 * 
 * Usage:
 * - Place at the very beginning of the page (first focusable element)
 * - Links to the main content area with id="main-content"
 * - Visually hidden until focused
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

