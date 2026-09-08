/**
 * Tests for AyahBlock component.
 *
 * Scope: AyahBlock's own editorial rendering — no card wrapper, correct type
 * roles for each element, transliteration omission when absent, sequential DOM
 * reading order (Arabic -> translation -> transliteration), ayah number in
 * surah:numberInSurah form, and verbatim pass-through of Arabic/translation/
 * number text.
 *
 * Requirements: 5.6, 5.7, 9.1, 9.2, 9.5, 9.7, 9.8, 16.7
 *
 * AyahActionBar is mocked here: it pulls in the audio player, tafsir view, and
 * several Radix primitives that are exercised by their own tests. Mocking it
 * keeps this suite focused on AyahBlock's layout and typography contract.
 */

import { render, screen } from '@testing-library/react'
import { AyahBlock } from '../AyahBlock'
import type { AyahPair, QuranAyah } from '@/types/quran.types'

jest.mock('../AyahActionBar', () => ({
  AyahActionBar: () => <div data-testid="ayah-action-bar" />,
}))

// Minimal QuranAyah factory — only the fields AyahBlock reads (`text`) matter,
// the rest satisfy the type.
function makeAyah(text: string): QuranAyah {
  return {
    number: 1,
    text,
    edition: {
      identifier: 'quran-uthmani',
      language: 'ar',
      name: 'القرآن الكريم',
      englishName: 'Quran',
      format: 'text',
      type: 'quran',
      direction: 'rtl',
    },
    surah: {
      number: 2,
      name: 'البقرة',
      englishName: 'Al-Baqarah',
      englishNameTranslation: 'The Cow',
      numberOfAyahs: 286,
      revelationType: 'Medinan',
    },
    numberInSurah: 255,
    juz: 3,
    manzil: 1,
    page: 42,
    ruku: 35,
    hizbQuarter: 21,
    sajda: false,
  }
}

const ARABIC_TEXT = 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ'
const TRANSLATION_TEXT = 'God — there is no deity save Him, the Ever-Living, the Self-Subsistent Fount of All Being.'
const TRANSLITERATION_TEXT = 'Allahu la ilaha illa huwal hayyul qayyum'

function makePair(overrides?: {
  arabic?: string
  translation?: string
  transliteration?: string
  numberInSurah?: number
}): AyahPair {
  return {
    numberInSurah: overrides?.numberInSurah ?? 255,
    globalNumber: 262,
    arabic: makeAyah(overrides?.arabic ?? ARABIC_TEXT),
    transliteration: makeAyah(overrides?.transliteration ?? TRANSLITERATION_TEXT),
    translation: makeAyah(overrides?.translation ?? TRANSLATION_TEXT),
  }
}

// Common props for AyahBlock — the action-bar callbacks are mocked away but the
// props must still be supplied to satisfy the component contract.
const baseProps = {
  surahNumber: 2,
  surahName: 'Al-Baqarah',
  reciter: 'ar.alafasy' as const,
  isFavorited: () => false,
  addFavorite: jest.fn(async () => true),
  removeFavorite: jest.fn(async () => true),
  getBookmark: () => undefined,
  saveBookmark: jest.fn(async () => true),
  deleteBookmark: jest.fn(async () => true),
}

describe('AyahBlock', () => {
  it('does not wrap the ayah in a bordered or elevated rounded card (Req 9.1)', () => {
    const { container } = render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const article = container.querySelector('article')
    expect(article).toBeInTheDocument()

    // No card affordances anywhere in the block: no rounded card, border box,
    // or elevation shadow. The active-state uses only a left rule + subtle tint,
    // and dividers are single hairlines, neither of which is a card.
    const cardLike = container.querySelectorAll(
      '[class*="rounded-lg"], [class*="rounded-xl"], [class*="rounded-2xl"], [class*="shadow"], [class*="card"]'
    )
    expect(cardLike).toHaveLength(0)
  })

  it('renders the Arabic text with the type-quran-arabic role, RTL, and lang=ar (Req 9.2, 16.7)', () => {
    render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const arabic = screen.getByText(ARABIC_TEXT)
    expect(arabic).toHaveClass('type-quran-arabic')
    expect(arabic).toHaveAttribute('dir', 'rtl')
    expect(arabic).toHaveAttribute('lang', 'ar')
  })

  it('renders the translation text with the type-quran-translation role (Req 9.2)', () => {
    render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const translation = screen.getByText(TRANSLATION_TEXT)
    expect(translation).toHaveClass('type-quran-translation')
  })

  it('renders the ayah number with the type-eyebrow role (Req 9.2)', () => {
    render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const number = screen.getByText('2:255')
    expect(number).toHaveClass('type-eyebrow')
  })

  it('renders the ayah number as surah:numberInSurah (Req 9.2, 9.8)', () => {
    render(
      <AyahBlock
        ayahPair={makePair({ numberInSurah: 7 })}
        {...baseProps}
        surahNumber={18}
      />
    )

    expect(screen.getByText('18:7')).toBeInTheDocument()
  })

  it('renders the transliteration with the type-quran-translation role when present (Req 9.2)', () => {
    render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const transliteration = screen.getByText(TRANSLITERATION_TEXT)
    expect(transliteration).toHaveClass('type-quran-translation')
  })

  it('omits the transliteration element entirely when transliteration text is absent (Req 9.7)', () => {
    render(<AyahBlock ayahPair={makePair({ transliteration: '' })} {...baseProps} />)

    // No placeholder and no reserved empty transliteration node.
    expect(screen.queryByText(TRANSLITERATION_TEXT)).not.toBeInTheDocument()

    // Arabic and translation still render; the ayah has exactly three <p>
    // elements (number, Arabic, translation) rather than four.
    const { container } = render(
      <AyahBlock ayahPair={makePair({ transliteration: '' })} {...baseProps} />
    )
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(3)
  })

  it('renders all four elements (number, Arabic, translation, transliteration) when transliteration is present (Req 9.2)', () => {
    const { container } = render(<AyahBlock ayahPair={makePair()} {...baseProps} />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(4)
  })

  it('presents Arabic, then translation, then transliteration in DOM reading order (Req 16.7)', () => {
    const { container } = render(<AyahBlock ayahPair={makePair()} {...baseProps} />)

    const arabic = screen.getByText(ARABIC_TEXT)
    const translation = screen.getByText(TRANSLATION_TEXT)
    const transliteration = screen.getByText(TRANSLITERATION_TEXT)

    // Establish document order via compareDocumentPosition.
    expect(
      arabic.compareDocumentPosition(translation) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      translation.compareDocumentPosition(transliteration) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()

    // Cross-check against the actual paragraph sequence: number is first,
    // then Arabic -> translation -> transliteration.
    const paragraphs = Array.from(container.querySelectorAll('p'))
    expect(paragraphs[0]).toHaveTextContent('2:255')
    expect(paragraphs[1]).toBe(arabic)
    expect(paragraphs[2]).toBe(translation)
    expect(paragraphs[3]).toBe(transliteration)
  })

  it('passes Arabic, translation, and number text through verbatim without transform or truncation (Req 5.6, 9.8)', () => {
    const rawArabic = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
    const rawTranslation = 'In the name of God, the Most Gracious, the Dispenser of Grace.'

    render(
      <AyahBlock
        ayahPair={makePair({
          arabic: rawArabic,
          translation: rawTranslation,
          numberInSurah: 1,
        })}
        {...baseProps}
        surahNumber={1}
      />
    )

    const arabic = screen.getByText(rawArabic)
    const translation = screen.getByText(rawTranslation)
    const number = screen.getByText('1:1')

    // Exact textContent match — nothing added, dropped, or reordered.
    expect(arabic).toHaveTextContent(rawArabic)
    expect(translation).toHaveTextContent(rawTranslation)
    expect(number.textContent).toBe('1:1')

    // No text-transform applied on Arabic, translation, or number elements
    // (case/character casing preserved).
    for (const el of [arabic, translation, number]) {
      const transform = (el as HTMLElement).style.textTransform
      expect(transform === '' || transform === 'none').toBe(true)
    }
  })

  it('renders the action bar as a child of the block', () => {
    render(<AyahBlock ayahPair={makePair()} {...baseProps} />)
    expect(screen.getByTestId('ayah-action-bar')).toBeInTheDocument()
  })
})
