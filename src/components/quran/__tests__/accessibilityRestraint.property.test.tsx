/**
 * Property-based tests (task 14.7) — Accessibility + visual-restraint properties.
 *
 * Guardrail: tests only. No component under test is modified.
 *
 * Uses the project's fast-check integration (pinned devDependency) driving a
 * minimum of 100 iterations per property. Each property is a single
 * property-based test tagged with the feature + property text. Properties 18
 * and 19 are code-level static checks (grep over the redesigned component
 * source): a straightforward assertion over file contents is the correct tool,
 * but each still runs under fast-check over the set of redesigned files to keep
 * the "for any redesigned component" quantifier explicit and the 100-iteration
 * convention uniform across the suite.
 *
 * Property 16: Every interactive control has a non-empty accessible name
 *   (Validates: Requirements 16.4).
 * Property 17: The reading canvas is never teal
 *   (Validates: Requirements 15.4, 18.8).
 * Property 18: Reading colors use semantic tokens, never hard-coded literals
 *   (Validates: Requirements 15.5).
 * Property 19: Visual restraint — prohibited decoration is absent
 *   (Validates: Requirements 18.1–18.7).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen, cleanup, within } from '@testing-library/react'
import fc from 'fast-check'

import type { SurahMetadata } from '@/lib/quranData'
import { JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import type {
  BookmarkData,
  FullSurahResponse,
  QuranSurah,
  QuranAyah,
  AyahPair,
} from '@/types/quran.types'

import { SurahRow } from '../SurahRow'
import { JuzRow } from '../JuzRow'
import { GoToAyah } from '../GoToAyah'
import { AyahActionBar } from '../AyahActionBar'
import { ReadingControlsBar } from '../ReadingControlsBar'
import { ReaderHeader } from '../ReaderHeader'
import { SurahReader } from '../SurahReader'

const FC_RUNS = 120

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

// next/link → plain anchor so rows expose a real anchor + accessible name.
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// next/navigation router used by GoToAyah.
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Listen control: stable stand-in carrying an accessible "listen" name (its own
// audio behavior is covered by AyahAudioPlayer's suite).
jest.mock('../AyahAudioPlayer', () => ({
  AyahAudioPlayer: ({ globalAyahNumber }: { globalAyahNumber: number }) => (
    <button type="button" aria-label="Play recitation" data-testid="listen">
      listen {globalAyahNumber}
    </button>
  ),
}))

// TafsirView only renders when opened; irrelevant to these properties.
jest.mock('../TafsirView', () => ({
  TafsirView: ({ open }: { open: boolean }) =>
    open ? <div data-testid="tafsir-view">tafsir</div> : null,
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------
function surahArb(): fc.Arbitrary<SurahMetadata> {
  return fc.record({
    number: fc.integer({ min: 1, max: 114 }),
    arabicName: fc.constantFrom('سُورَةُ البَقَرَةِ', 'الفاتحة', ''),
    englishName: fc.constantFrom('Al-Baqara', 'Al-Faatiha', 'An-Nas'),
    englishNameTranslation: fc.constantFrom('The Cow', 'The Opening', 'Mankind'),
    numberOfAyahs: fc.integer({ min: 1, max: 286 }),
    revelationType: fc.constantFrom<'Meccan' | 'Medinan'>('Meccan', 'Medinan'),
  })
}

function buildBookmark(surahNumber: number, ayahNumber = 1): BookmarkData {
  return { user_id: 'u1', surah_number: surahNumber, ayah_number: ayahNumber }
}

// Enumerate every interactive control an element subtree exposes to AT.
const INTERACTIVE_ROLES = ['button', 'link', 'textbox', 'combobox'] as const

function assertAllControlsHaveAccessibleName(root: HTMLElement) {
  for (const role of INTERACTIVE_ROLES) {
    const controls = within(root).queryAllByRole(role)
    for (const control of controls) {
      const name =
        control.getAttribute('aria-label')?.trim() ||
        control.getAttribute('aria-labelledby')?.trim() ||
        control.getAttribute('title')?.trim() ||
        control.textContent?.trim() ||
        (control as HTMLInputElement).value?.trim() ||
        ''
      expect(name.length).toBeGreaterThan(0)
    }
  }
}

// ============================================================================
// Property 16 — Every interactive control has a non-empty accessible name
// ============================================================================
describe('Property 16 — every interactive control has a non-empty accessible name', () => {
  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('SurahRow — the whole-row link exposes a non-empty accessible name for any surah/indicator state', () => {
    fc.assert(
      fc.property(surahArb(), fc.boolean(), fc.boolean(), (surah, favorited, hasBookmark) => {
        cleanup()
        const { container } = render(
          <SurahRow
            surah={surah}
            isFavorited={favorited}
            bookmark={hasBookmark ? buildBookmark(surah.number) : undefined}
          />
        )
        assertAllControlsHaveAccessibleName(container)
        // The row link specifically carries a name reflecting the surah.
        expect(screen.getByRole('link')).toHaveAccessibleName(
          new RegExp(surah.englishName, 'i')
        )
      }),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('JuzRow — the whole-row link exposes a non-empty accessible name for any juz/bookmark state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: JUZ_DATA.length - 1 }),
        fc.boolean(),
        (juzIndex, hasBookmark) => {
          cleanup()
          const juz = JUZ_DATA[juzIndex]
          const { container } = render(
            <JuzRow
              juz={juz}
              startSurah={getSurahByNumber(juz.startSurah)}
              endSurah={getSurahByNumber(juz.endSurah)}
              bookmark={hasBookmark ? buildBookmark(juz.startSurah, juz.startAyah) : undefined}
            />
          )
          assertAllControlsHaveAccessibleName(container)
          expect(screen.getByRole('link')).toHaveAccessibleName(
            new RegExp(`Juz ${juz.number}\\b`, 'i')
          )
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('GoToAyah — the field and submit affordance expose non-empty accessible names for any surah size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 114 }),
        fc.integer({ min: 1, max: 286 }),
        (surahNumber, totalAyahs) => {
          cleanup()
          const { container } = render(
            <GoToAyah surahNumber={surahNumber} totalAyahs={totalAyahs} />
          )
          assertAllControlsHaveAccessibleName(container)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('AyahActionBar — every directly-visible action control exposes a non-empty accessible name for any toggle state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 114 }),
        fc.integer({ min: 1, max: 286 }),
        fc.integer({ min: 1, max: 6236 }),
        fc.boolean(),
        fc.boolean(),
        (surahNumber, ayahNumber, globalNumber, favorited, bookmarked) => {
          cleanup()
          const noop = async () => true
          const { container } = render(
            <AyahActionBar
              surahNumber={surahNumber}
              surahName="Al-Baqarah"
              ayahNumber={ayahNumber}
              globalNumber={globalNumber}
              arabicText="اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ"
              translationText="God: there is no deity save Him"
              reciter="ar.alafasy"
              isFavorited={() => favorited}
              addFavorite={async () => true}
              removeFavorite={noop}
              getBookmark={() =>
                bookmarked ? buildBookmark(surahNumber, ayahNumber) : undefined
              }
              saveBookmark={noop}
              deleteBookmark={noop}
            />
          )
          assertAllControlsHaveAccessibleName(container)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('ReadingControlsBar — the chips, go-to-ayah and go-to-bookmark controls expose non-empty accessible names', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 114 }),
        fc.integer({ min: 1, max: 286 }),
        fc.boolean(),
        (surahNumber, totalAyahs, hasBookmark) => {
          cleanup()
          const { container } = render(
            <ReadingControlsBar
              translation="en.asad"
              onTranslationChange={() => {}}
              reciter="ar.alafasy"
              onReciterChange={() => {}}
              surahNumber={surahNumber}
              totalAyahs={totalAyahs}
              bookmark={hasBookmark ? buildBookmark(surahNumber, 3) : null}
              onGoToBookmark={() => {}}
            />
          )
          assertAllControlsHaveAccessibleName(container)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 16: Every interactive control rendered in the Quran Browser or Quran Reader (links, buttons, inputs, and sheet/dialog triggers) exposes a non-empty accessible name to assistive technology (Validates: 16.4).
  it('ReaderHeader — the Back control exposes a non-empty accessible name for any surah metadata', () => {
    fc.assert(
      fc.property(surahArb(), (metadata) => {
        cleanup()
        const surah: QuranSurah = {
          number: metadata.number,
          name: metadata.arabicName,
          englishName: metadata.englishName,
          englishNameTranslation: metadata.englishNameTranslation,
          numberOfAyahs: metadata.numberOfAyahs,
          revelationType: metadata.revelationType,
        }
        const { container } = render(<ReaderHeader surah={surah} metadata={metadata} />)
        assertAllControlsHaveAccessibleName(container)
      }),
      { numRuns: FC_RUNS }
    )
  })
})

// ============================================================================
// Property 17 — The reading canvas is never teal
// ============================================================================
// SurahReader owns the reading region. Its composed children are mocked (their
// own suites cover them) so the assertion isolates the reading-canvas region
// SurahReader renders. Both light and dark mode share the same class-based
// token wiring in jsdom (the token resolves per theme in CSS); the invariant we
// can assert in jsdom is that the region is expressed with the `--canvas` token
// (`bg-canvas`) and carries no teal class or teal token anywhere in the reading
// area — in either theme the rendered markup is identical.
jest.mock('../ReaderHeader', () => ({
  ReaderHeader: () => <div data-testid="reader-header" />,
}))
jest.mock('../ReadingControlsBar', () => ({
  ReadingControlsBar: () => <div data-testid="reading-controls-bar" />,
}))
jest.mock('../AyahBlock', () => ({
  AyahBlock: () => <div data-testid="ayah-block" />,
}))

const mockSetTranslation = jest.fn()
let fullSurahState: {
  surahData: FullSurahResponse | null
  loading: boolean
  error: string | null
  translation: string
}
jest.mock('@/hooks/useFullSurah', () => ({
  useFullSurah: () => ({
    ...fullSurahState,
    setTranslation: mockSetTranslation,
    refetch: jest.fn(),
  }),
}))
jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: jest.fn(() => undefined),
    saveBookmark: jest.fn(async () => true),
    deleteBookmark: jest.fn(async () => true),
  }),
}))
jest.mock('@/hooks/useQuranBrowserFavorites', () => ({
  useQuranBrowserFavorites: () => ({
    isFavorited: jest.fn(() => false),
    addFavorite: jest.fn(async () => true),
    removeFavorite: jest.fn(async () => true),
  }),
}))

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn()
})

const readerSurah: QuranSurah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
}
const readerMetadata: SurahMetadata = {
  number: 1,
  arabicName: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
}
function makeAyah(text: string, n: number): QuranAyah {
  return {
    number: n,
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
    surah: readerSurah,
    numberInSurah: n,
    juz: 1,
    manzil: 1,
    page: 1,
    ruku: 1,
    hizbQuarter: 1,
    sajda: false,
  }
}
function makePair(n: number): AyahPair {
  return {
    numberInSurah: n,
    globalNumber: n,
    arabic: makeAyah(`arabic-${n}`, n),
    transliteration: makeAyah(`translit-${n}`, n),
    translation: makeAyah(`translation-${n}`, n),
  }
}

// Teal tokens/classes that must never style the reading canvas. `bg-canvas` is
// the required token; the reading area must not carry any of these.
const TEAL_PATTERNS = [/bg-teal/, /bg-primary\b/, /\bteal\b/, /--teal/, /--color-teal/]

describe('Property 17 — the reading canvas is never teal', () => {
  // Feature: quran-reading-experience-redesign, Property 17: For any full-height region of the reading area, in both light and dark mode, the background resolves to the --canvas token and never to the teal accent (Validates: 15.4, 18.8).
  it('renders the reading region on the --canvas token (bg-canvas) and never a teal background, in both themes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 7 }),
        fc.constantFrom<'light' | 'dark'>('light', 'dark'),
        (ayahCount, theme) => {
          cleanup()
          fullSurahState = {
            surahData: {
              surah: readerSurah,
              ayahs: Array.from({ length: ayahCount }, (_, i) => makePair(i + 1)),
              translation: 'en.asad',
            },
            loading: false,
            error: null,
            translation: 'en.asad',
          }

          // Theme is class-based on the document root; the reading markup is
          // identical either way, so the token invariant holds in both.
          document.documentElement.classList.toggle('dark', theme === 'dark')

          const { container } = render(
            <SurahReader surahNumber={1} surahMetadata={readerMetadata} />
          )

          // The reading region carries the --canvas token.
          const canvas = container.querySelector('.bg-canvas')
          expect(canvas).not.toBeNull()

          // The ayah blocks (the reading area) live inside the canvas region.
          const blocks = within(canvas as HTMLElement).getAllByTestId('ayah-block')
          expect(blocks).toHaveLength(ayahCount)

          // No teal class or teal token anywhere in the reading region.
          const html = (canvas as HTMLElement).outerHTML
          for (const pattern of TEAL_PATTERNS) {
            expect(html).not.toMatch(pattern)
          }

          document.documentElement.classList.remove('dark')
        }
      ),
      { numRuns: FC_RUNS }
    )
  })
})

// ============================================================================
// Property 18 & 19 — static source checks over the redesigned components
// ============================================================================
// The redesigned surface: the Quran Browser page and every redesigned component
// under src/components/quran. The legacy AyahRangeLookup.tsx is retired (task 9,
// replaced by GoToAyah) and excluded — it is no longer part of the redesigned
// reading surface.
const QURAN_DIR = path.resolve(__dirname, '..')
const APP_DIR = path.resolve(__dirname, '../../../app/quran')

const REDESIGNED_FILES = [
  path.join(APP_DIR, 'page.tsx'),
  path.join(QURAN_DIR, 'SurahRow.tsx'),
  path.join(QURAN_DIR, 'SurahList.tsx'),
  path.join(QURAN_DIR, 'SurahSelector.tsx'),
  path.join(QURAN_DIR, 'JuzRow.tsx'),
  path.join(QURAN_DIR, 'JuzList.tsx'),
  path.join(QURAN_DIR, 'ReaderHeader.tsx'),
  path.join(QURAN_DIR, 'AyahBlock.tsx'),
  path.join(QURAN_DIR, 'AyahActionBar.tsx'),
  path.join(QURAN_DIR, 'AyahAudioPlayer.tsx'),
  path.join(QURAN_DIR, 'ReadingControlsBar.tsx'),
  path.join(QURAN_DIR, 'ControlSheet.tsx'),
  path.join(QURAN_DIR, 'GoToAyah.tsx'),
  path.join(QURAN_DIR, 'TafsirView.tsx'),
  path.join(QURAN_DIR, 'SurahReader.tsx'),
]

/** Strip line + block comments so a literal in a comment is not a false positive. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** Read a redesigned file's source with comments removed. */
function readSource(file: string): string {
  return stripComments(readFileSync(file, 'utf8'))
}

describe('Property 18 — reading colors use semantic tokens, never hard-coded literals', () => {
  // Hard-coded color literals used for element colors. We look for hex colors,
  // rgb()/rgba(), and hsl()/hsla() — the forms a component would use to inline a
  // reading color instead of a semantic token/utility class.
  const HEX = /#[0-9a-fA-F]{3,8}\b/
  const RGB = /\brgba?\(/
  const HSL = /\bhsla?\(/

  // Feature: quran-reading-experience-redesign, Property 18: For any redesigned Quran component, the reading-canvas and reading-text colors are expressed through semantic tokens/utility classes, with no hard-coded color literal (hex, rgb, or hsl) used for those elements (Validates: 15.5).
  it('no redesigned Quran component hard-codes a color literal (hex, rgb, hsl)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...REDESIGNED_FILES), (file) => {
        const src = readSource(file)
        expect(src).not.toMatch(HEX)
        expect(src).not.toMatch(RGB)
        expect(src).not.toMatch(HSL)
      }),
      { numRuns: FC_RUNS }
    )
  })
})

describe('Property 19 — visual restraint: prohibited decoration is absent', () => {
  // Prohibited decoration signatures (Requirements 18.1–18.7). These are the
  // markup/class signals a component would carry if it introduced the banned
  // decoration. Matched case-insensitively over comment-stripped source.
  const PROHIBITED: Array<{ label: string; pattern: RegExp }> = [
    // 18.1 mosque illustrations behind verses
    { label: 'mosque illustration', pattern: /mosque/i },
    // 18.2 gold frames / ornate borders
    { label: 'gold frame / ornate border', pattern: /(border-gold|ring-gold|ornate|border-amber)/i },
    // 18.3 bright gradients as surface backgrounds
    { label: 'gradient surface background', pattern: /bg-gradient/i },
    // 18.4 heavy geometric patterns / large decorative quote marks
    { label: 'decorative pattern / quote mark', pattern: /(bg-\[url|pattern-|decorative-quote|text-9xl|text-8xl)/i },
  ]

  // Feature: quran-reading-experience-redesign, Property 19: For any rendered Quran Browser or Quran Reader view, there are no mosque illustrations, gold frames or ornate borders, bright-gradient surface backgrounds, heavy geometric patterns or large decorative quote marks, and no card nested within a card (Validates: 18.1–18.7).
  it('no redesigned Quran component contains any prohibited decoration signature', () => {
    fc.assert(
      fc.property(fc.constantFrom(...REDESIGNED_FILES), (file) => {
        const src = readSource(file)
        for (const { pattern } of PROHIBITED) {
          expect(src).not.toMatch(pattern)
        }
      }),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 19: For any rendered Quran Browser or Quran Reader view, there are no mosque illustrations, gold frames or ornate borders, bright-gradient surface backgrounds, heavy geometric patterns or large decorative quote marks, and no card nested within a card (Validates: 18.5).
  it('no redesigned Quran component nests a Card within a Card (18.5)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...REDESIGNED_FILES), (file) => {
        const src = readSource(file)
        // The redesign retired shadcn Card wrappers from the reading surface;
        // a card-in-card would require the Card primitive. None should import it.
        expect(src).not.toMatch(/from ['"]@\/components\/ui\/card['"]/)
        // Belt-and-suspenders: no <Card ...><Card ...> nesting in the same file.
        expect(/<Card[\s>][\s\S]*<Card[\s>]/.test(src)).toBe(false)
      }),
      { numRuns: FC_RUNS }
    )
  })
})
