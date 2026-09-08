import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AyahAudioPlayer } from '../AyahAudioPlayer'
import { getAyahAudioUrl } from '@/lib/quranAudio'

// -----------------------------------------------------------------------------
// Mock Audio API
//
// The mock records the src assigned and the preload value set by the component
// so the tests can assert the audio source is built from getAyahAudioUrl and
// that preload is 'none' (Requirement 11.1). Instances are tracked so a test
// can drive the 'error' event to exercise the audio-error state (Requirement
// 11.5).
// -----------------------------------------------------------------------------
class MockAudio {
  src = ''
  preload = 'auto'
  paused = true
  ended = false
  playCalls = 0
  pauseCalls = 0
  private listeners: { [key: string]: (() => void)[] } = {}

  constructor(src?: string) {
    if (src) this.src = src
    MockAudio.instances.push(this)
  }

  static instances: MockAudio[] = []
  static reset() {
    MockAudio.instances = []
  }

  addEventListener(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  removeEventListener(event: string, callback: () => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  play() {
    this.playCalls += 1
    this.paused = false
    this.trigger('canplay')
    return Promise.resolve()
  }

  pause() {
    this.pauseCalls += 1
    this.paused = true
  }

  trigger(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb())
    }
  }
}

global.Audio = MockAudio as unknown as typeof Audio

describe('AyahAudioPlayer', () => {
  beforeEach(() => {
    MockAudio.reset()
    jest.clearAllMocks()
  })

  // Requirement 11.1: audio source is built from getAyahAudioUrl(globalNumber,
  // reciter), and preload is 'none' to avoid eager network use.
  it('builds the audio source from getAyahAudioUrl and sets preload to none', () => {
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.husary" />)

    const audio = MockAudio.instances[0]
    expect(audio).toBeDefined()
    expect(audio.src).toBe(getAyahAudioUrl(262, 'ar.husary'))
    expect(audio.preload).toBe('none')
  })

  // Requirement 11.4 / 16.4: the initial (paused) state exposes a Play icon
  // toggle whose accessible name is "Play recitation". State is conveyed by an
  // icon plus accessible text, not by a visible text label.
  it('renders a play toggle with an accessible name and icon, no visible text label', () => {
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

    const button = screen.getByRole('button', { name: /play recitation/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Play recitation')

    // Accessible text is present for assistive tech, but only visually hidden.
    const srText = button.querySelector('.sr-only')
    expect(srText).toHaveTextContent('Play recitation')

    // Icon-only: an svg icon is rendered and marked decorative.
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  // Requirement 11.2 / 11.4: activating the listen action toggles to a playing
  // state whose accessible name becomes "Pause recitation".
  it('toggles to a pause state with a pause-recitation accessible name when activated', async () => {
    const user = userEvent.setup()
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

    const playButton = screen.getByRole('button', { name: /play recitation/i })
    await user.click(playButton)

    await waitFor(() => {
      const pauseButton = screen.getByRole('button', { name: /pause recitation/i })
      expect(pauseButton).toBeInTheDocument()
      expect(pauseButton).toHaveAttribute('aria-label', 'Pause recitation')
    })

    expect(MockAudio.instances[0].playCalls).toBe(1)
  })

  // Requirement 11.2: activating again pauses playback and restores the play
  // accessible name.
  it('returns to the play state and pauses audio on a second activation', async () => {
    const user = userEvent.setup()
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

    const button = screen.getByRole('button', { name: /play recitation/i })
    await user.click(button)

    await screen.findByRole('button', { name: /pause recitation/i })
    await user.click(screen.getByRole('button', { name: /pause recitation/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /play recitation/i })
      ).toBeInTheDocument()
    })
    expect(MockAudio.instances[0].pauseCalls).toBeGreaterThanOrEqual(1)
  })

  // Requirement 11.5: when audio fails to load, an audio-error state is shown
  // with an "Audio unavailable" accessible name, and the control is disabled.
  it('shows a disabled audio-error state with an accessible name when loading fails', async () => {
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

    const audio = MockAudio.instances[0]
    act(() => {
      audio.trigger('error')
    })

    await waitFor(() => {
      const errorButton = screen.getByRole('button', { name: /audio unavailable/i })
      expect(errorButton).toBeInTheDocument()
      expect(errorButton).toBeDisabled()
      expect(errorButton).toHaveAttribute('aria-label', 'Audio unavailable')
    })

    const errorButton = screen.getByRole('button', { name: /audio unavailable/i })
    const icon = errorButton.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(errorButton.querySelector('.sr-only')).toHaveTextContent('Audio unavailable')
  })

  // Requirement 11.3 / 11.6 / 16.6: verify the loading branch directly by
  // observing the loading accessible name and the reduced-motion static
  // indicator while the play() promise is still pending.
  it('renders a loading indicator and a static reduced-motion indicator while loading', async () => {
    // Make play() hang so the component stays in the loading state.
    let resolvePlay: () => void = () => {}
    const pending = new Promise<void>(resolve => {
      resolvePlay = resolve
    })
    const originalPlay = MockAudio.prototype.play
    MockAudio.prototype.play = function (this: MockAudio) {
      this.playCalls += 1
      // Do not resolve immediately; keep the component in the loading branch.
      return pending
    } as unknown as typeof MockAudio.prototype.play

    try {
      const user = userEvent.setup()
      render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

      await user.click(screen.getByRole('button', { name: /play recitation/i }))

      const loadingButton = await screen.findByRole('button', {
        name: /loading recitation/i,
      })
      expect(loadingButton).toBeInTheDocument()
      expect(loadingButton).toBeDisabled()

      // Animated spinner: present but hidden under reduced-motion.
      // Note: SVG elements expose className as SVGAnimatedString, so read the
      // class attribute string directly rather than the className property.
      const animated = loadingButton.querySelector('.animate-spin')
      expect(animated).toBeInTheDocument()
      expect(animated?.getAttribute('class')).toContain('motion-reduce:hidden')

      // Static indicator: shown under reduced-motion, hidden otherwise.
      const staticIndicator = loadingButton.querySelector('.motion-reduce\\:block')
      expect(staticIndicator).toBeInTheDocument()
      expect(staticIndicator?.getAttribute('class')).toContain('hidden')

      // Accessible text still reflects the loading state.
      expect(loadingButton.querySelector('.sr-only')).toHaveTextContent(
        'Loading recitation'
      )
    } finally {
      resolvePlay()
      MockAudio.prototype.play = originalPlay
    }
  })

  it('rebuilds the audio source when the reciter changes', () => {
    const { rerender } = render(
      <AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />
    )
    expect(MockAudio.instances[0].src).toBe(getAyahAudioUrl(262, 'ar.alafasy'))

    rerender(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.husary" />)

    const latest = MockAudio.instances[MockAudio.instances.length - 1]
    expect(latest.src).toBe(getAyahAudioUrl(262, 'ar.husary'))
  })

  it('cleans up audio on unmount', () => {
    const { unmount } = render(
      <AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />
    )
    const audio = MockAudio.instances[0]

    unmount()

    expect(audio.pauseCalls).toBeGreaterThanOrEqual(1)
    expect(audio.src).toBe('')
  })

  it('applies a custom className when provided', () => {
    render(
      <AyahAudioPlayer
        globalAyahNumber={262}
        reciter="ar.alafasy"
        className="custom-class"
      />
    )

    const button = screen.getByRole('button', { name: /play recitation/i })
    expect(button).toHaveClass('custom-class')
  })

  it('is not disabled in the initial play state', () => {
    render(<AyahAudioPlayer globalAyahNumber={262} reciter="ar.alafasy" />)

    const button = screen.getByRole('button', { name: /play recitation/i })
    expect(button).not.toBeDisabled()
  })
})
