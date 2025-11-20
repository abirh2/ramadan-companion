/**
 * Tests for useAnnouncer hook
 */

import { renderHook, act } from '@testing-library/react'
import { useAnnouncer } from '../useAnnouncer'

describe('useAnnouncer', () => {
  beforeEach(() => {
    // Clean up any existing live regions
    document.querySelectorAll('[id^="aria-live-"]').forEach(el => el.remove())
  })

  it('creates live regions on mount', () => {
    renderHook(() => useAnnouncer())

    const politeRegion = document.getElementById('aria-live-polite')
    const assertiveRegion = document.getElementById('aria-live-assertive')

    expect(politeRegion).toBeInTheDocument()
    expect(assertiveRegion).toBeInTheDocument()
    expect(politeRegion).toHaveAttribute('aria-live', 'polite')
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
  })

  it('announces message to polite region', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test message')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    const politeRegion = document.getElementById('aria-live-polite')
    expect(politeRegion?.textContent).toBe('Test message')

    jest.useRealTimers()
  })

  it('announces message to assertive region', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Urgent message', 'assertive')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    const assertiveRegion = document.getElementById('aria-live-assertive')
    expect(assertiveRegion?.textContent).toBe('Urgent message')

    jest.useRealTimers()
  })

  it('clears previous message before announcing new one', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('First message')
    })

    const politeRegion = document.getElementById('aria-live-polite')
    expect(politeRegion?.textContent).toBe('')

    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(politeRegion?.textContent).toBe('First message')

    act(() => {
      result.current.announce('Second message')
    })

    expect(politeRegion?.textContent).toBe('')

    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(politeRegion?.textContent).toBe('Second message')

    jest.useRealTimers()
  })

  it('clears all announcements', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test message polite', 'polite')
      result.current.announce('Test message assertive', 'assertive')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    act(() => {
      result.current.clear()
    })

    const politeRegion = document.getElementById('aria-live-polite')
    const assertiveRegion = document.getElementById('aria-live-assertive')

    expect(politeRegion?.textContent).toBe('')
    expect(assertiveRegion?.textContent).toBe('')

    jest.useRealTimers()
  })

  it('respects custom delay option', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test message', 'polite', { delay: 500 })
    })

    act(() => {
      jest.advanceTimersByTime(400)
    })

    const politeRegion = document.getElementById('aria-live-polite')
    expect(politeRegion?.textContent).toBe('')

    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(politeRegion?.textContent).toBe('Test message')

    jest.useRealTimers()
  })

  it('does not clear previous message when clearPrevious is false', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('First message')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    const politeRegion = document.getElementById('aria-live-polite')
    expect(politeRegion?.textContent).toBe('First message')

    act(() => {
      result.current.announce('Second message', 'polite', { clearPrevious: false })
    })

    // Should not clear immediately
    expect(politeRegion?.textContent).toBe('First message')

    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(politeRegion?.textContent).toBe('Second message')

    jest.useRealTimers()
  })
})

