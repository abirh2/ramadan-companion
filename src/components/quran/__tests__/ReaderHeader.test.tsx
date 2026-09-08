/**
 * Tests for ReaderHeader component (frameless editorial reader header)
 *
 * Covers Requirements:
 * - 4.1: renders English name, translated meaning, "Surah N · type · N Ayahs", Arabic name
 * - 4.2: no filled gray boxed card and no bright gradient background
 * - 4.4: provides a control to return to the Quran Browser (Back link to /quran)
 * - 16.4: non-empty accessible name on the Back control
 */

import { render, screen } from '@testing-library/react'
import { ReaderHeader } from '../ReaderHeader'
import type { QuranSurah } from '@/types/quran.types'
import type { SurahMetadata } from '@/lib/quranData'

const metadata: SurahMetadata = {
  number: 2,
  arabicName: 'البقرة',
  englishName: 'Al-Baqarah',
  englishNameTranslation: 'The Cow',
  numberOfAyahs: 286,
  revelationType: 'Medinan',
}

const surah: QuranSurah = {
  number: 2,
  name: 'البقرة',
  englishName: 'Al-Baqarah',
  englishNameTranslation: 'The Cow',
  numberOfAyahs: 286,
  revelationType: 'Medinan',
}

function renderHeader(overrides?: Partial<SurahMetadata>) {
  const meta = { ...metadata, ...overrides }
  return render(<ReaderHeader surah={surah} metadata={meta} />)
}

describe('ReaderHeader', () => {
  it('renders the English name of the surah (Requirement 4.1)', () => {
    renderHeader()
    expect(
      screen.getByRole('heading', { name: 'Al-Baqarah' })
    ).toBeInTheDocument()
  })

  it('renders the translated meaning (Requirement 4.1)', () => {
    renderHeader()
    expect(screen.getByText('The Cow')).toBeInTheDocument()
  })

  it('renders the summary line "Surah N · type · N Ayahs" (Requirement 4.1)', () => {
    renderHeader()
    expect(
      screen.getByText('Surah 2 · Medinan · 286 Ayahs')
    ).toBeInTheDocument()
  })

  it('renders the Arabic name with the Arabic font and RTL direction (Requirements 4.1, 4.5)', () => {
    renderHeader()
    const arabic = screen.getByText('البقرة')
    expect(arabic).toBeInTheDocument()
    expect(arabic).toHaveAttribute('dir', 'rtl')
    expect(arabic).toHaveAttribute('lang', 'ar')
    expect(arabic).toHaveClass('type-quran-arabic')
  })

  it('provides a Back control that links to /quran (Requirement 4.4)', () => {
    renderHeader()
    const backLink = screen.getByRole('link')
    expect(backLink).toHaveAttribute('href', '/quran')
  })

  it('exposes a non-empty accessible name on the Back control (Requirement 16.4)', () => {
    renderHeader()
    // The Back control is a button rendered inside the link.
    const backButton = screen.getByRole('button', { name: /back to quran/i })
    expect(backButton).toBeInTheDocument()
    expect(backButton).toHaveAccessibleName()
    expect(backButton.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('renders a frameless header without gradient or boxed card wrapper classes (Requirement 4.2)', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header')
    expect(header).not.toBeNull()

    // Assert no gradient / filled-box / card wrapper classes anywhere in the header subtree.
    const gradientOrBox = [
      'bg-gradient-to-r',
      'bg-gradient-to-l',
      'bg-gradient-to-b',
      'bg-gradient-to-t',
      'bg-gradient-to-br',
      'bg-gradient-to-bl',
      'bg-gradient-to-tr',
      'bg-gradient-to-tl',
      'bg-muted',
      'bg-card',
      'rounded-lg',
      'rounded-xl',
      'shadow',
      'shadow-sm',
      'shadow-md',
    ]

    const allElements = [
      header as HTMLElement,
      ...Array.from(header!.querySelectorAll<HTMLElement>('*')),
    ]

    for (const el of allElements) {
      for (const cls of gradientOrBox) {
        expect(el.classList.contains(cls)).toBe(false)
      }
      // No inline gradient background either.
      const bg = el.getAttribute('style') ?? ''
      expect(bg.toLowerCase()).not.toContain('gradient')
    }
  })

  it('separates the header from ayah content with a subtle bottom hairline rather than an enclosing box (Requirement 4.3)', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header') as HTMLElement
    // The frameless separator is a bottom border on the header itself.
    expect(header.className).toMatch(/border-b/)
  })

  it('renders correct fields for a different surah (Requirement 4.1)', () => {
    renderHeader({
      number: 1,
      arabicName: 'الفاتحة',
      englishName: 'Al-Fatihah',
      englishNameTranslation: 'The Opening',
      numberOfAyahs: 7,
      revelationType: 'Meccan',
    })

    expect(
      screen.getByRole('heading', { name: 'Al-Fatihah' })
    ).toBeInTheDocument()
    expect(screen.getByText('The Opening')).toBeInTheDocument()
    expect(screen.getByText('Surah 1 · Meccan · 7 Ayahs')).toBeInTheDocument()
    expect(screen.getByText('الفاتحة')).toBeInTheDocument()
  })
})
