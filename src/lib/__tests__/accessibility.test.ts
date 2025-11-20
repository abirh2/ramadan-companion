/**
 * Tests for accessibility utilities
 */

import {
  generateAriaLabel,
  generateCardAriaLabel,
  generateLoadingLabel,
  generateErrorLabel,
  formatCountdownForScreenReader,
  generateKeyboardHint,
  shouldHandleKeyboardEvent,
  getKeyDisplayName,
} from '../accessibility'

describe('Accessibility Utilities', () => {
  describe('generateAriaLabel', () => {
    it('combines context and details into descriptive label', () => {
      const result = generateAriaLabel('Next Prayer', 'Asr in 2 hours')
      expect(result).toBe('Next Prayer: Asr in 2 hours')
    })

    it('handles empty details', () => {
      const result = generateAriaLabel('Prayer Times', '')
      expect(result).toBe('Prayer Times: ')
    })
  })

  describe('generateCardAriaLabel', () => {
    it('creates card label with title and description', () => {
      const result = generateCardAriaLabel('Prayer Times', 'View today\'s schedule')
      expect(result).toBe('Prayer Times card. View today\'s schedule')
    })

    it('creates card label with title only', () => {
      const result = generateCardAriaLabel('Quran')
      expect(result).toBe('Quran card')
    })
  })

  describe('generateLoadingLabel', () => {
    it('creates loading label', () => {
      const result = generateLoadingLabel('prayer times')
      expect(result).toBe('Loading prayer times...')
    })
  })

  describe('generateErrorLabel', () => {
    it('creates error label', () => {
      const result = generateErrorLabel('prayer times')
      expect(result).toBe('Error loading prayer times. Please try again.')
    })
  })

  describe('formatCountdownForScreenReader', () => {
    it('formats hours, minutes, and seconds', () => {
      const result = formatCountdownForScreenReader('2:15:30')
      expect(result).toBe('2 hours, 15 minutes, 30 seconds')
    })

    it('formats minutes and seconds only', () => {
      const result = formatCountdownForScreenReader('15:30')
      expect(result).toBe('15 minutes, 30 seconds')
    })

    it('handles singular units', () => {
      const result = formatCountdownForScreenReader('1:01:01')
      expect(result).toBe('1 hour, 1 minute, 1 second')
    })

    it('handles zero hours', () => {
      const result = formatCountdownForScreenReader('0:05:30')
      expect(result).toBe('5 minutes, 30 seconds')
    })

    it('returns original string for invalid format', () => {
      const result = formatCountdownForScreenReader('invalid')
      expect(result).toBe('invalid')
    })
  })

  describe('generateKeyboardHint', () => {
    it('creates keyboard hint text', () => {
      const result = generateKeyboardHint('Enter', 'submit form')
      expect(result).toBe('Press Enter to submit form')
    })
  })

  describe('shouldHandleKeyboardEvent', () => {
    it('returns true for div elements', () => {
      const div = document.createElement('div')
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'target', { value: div, writable: false })
      
      const result = shouldHandleKeyboardEvent(event)
      expect(result).toBe(true)
    })

    it('returns false for input elements', () => {
      const input = document.createElement('input')
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'target', { value: input, writable: false })
      
      const result = shouldHandleKeyboardEvent(event)
      expect(result).toBe(false)
    })

    it('returns false for textarea elements', () => {
      const textarea = document.createElement('textarea')
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'target', { value: textarea, writable: false })
      
      const result = shouldHandleKeyboardEvent(event)
      expect(result).toBe(false)
    })

    it('returns false for select elements', () => {
      const select = document.createElement('select')
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'target', { value: select, writable: false })
      
      const result = shouldHandleKeyboardEvent(event)
      expect(result).toBe(false)
    })
  })

  describe('getKeyDisplayName', () => {
    it('returns Space for space key', () => {
      expect(getKeyDisplayName(' ')).toBe('Space')
    })

    it('returns Enter for Enter key', () => {
      expect(getKeyDisplayName('Enter')).toBe('Enter')
    })

    it('returns Esc for Escape key', () => {
      expect(getKeyDisplayName('Escape')).toBe('Esc')
    })

    it('returns arrows for arrow keys', () => {
      expect(getKeyDisplayName('ArrowUp')).toBe('↑')
      expect(getKeyDisplayName('ArrowDown')).toBe('↓')
      expect(getKeyDisplayName('ArrowLeft')).toBe('←')
      expect(getKeyDisplayName('ArrowRight')).toBe('→')
    })

    it('returns uppercased letter for regular keys', () => {
      expect(getKeyDisplayName('a')).toBe('A')
      expect(getKeyDisplayName('z')).toBe('Z')
    })
  })
})

