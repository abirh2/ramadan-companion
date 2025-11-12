// Hadith and Collection Types

export interface HadithBook {
  id: number
  bookName: string
  writerName: string
  writerDeath: string
  bookSlug: string
}

export interface HadithChapter {
  id: number
  chapterNumber: string
  chapterEnglish: string
  chapterUrdu: string
  chapterArabic: string
  bookSlug: string
}

export interface HadithData {
  id: number
  hadithNumber: string
  englishNarrator: string
  hadithEnglish: string
  hadithUrdu: string
  urduNarrator: string
  hadithArabic: string
  headingArabic: string
  headingUrdu: string
  headingEnglish: string
  chapterId: string
  bookSlug: string
  volume: string
  status: 'Sahih' | 'Hasan' | "Da'eef"
  book: HadithBook
  chapter: HadithChapter
}

// Response from HadithAPI for single hadith
export interface HadithAPIResponse {
  status: number
  message: string
  hadith: HadithData
}

// Response from HadithAPI for multiple hadiths
export interface HadithAPIListResponse {
  status: number
  message: string
  hadiths: {
    current_page: number
    data: HadithData[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

// Our formatted response from /api/hadith
export interface DailyHadithResponse {
  hadithEnglish: string
  hadithUrdu: string
  hadithArabic: string
  narrator: string
  book: string
  bookSlug: string
  bookWriter: string
  chapter: string
  chapterArabic: string
  hadithNumber: string
  status: 'Sahih' | 'Hasan' | "Da'eef"
  volume?: string
}

// Language preference types
export type HadithLanguageId = 'english' | 'urdu' | 'arabic'

export interface HadithLanguage {
  id: HadithLanguageId
  name: string
  displayName: string
}

export const HADITH_LANGUAGES: HadithLanguage[] = [
  {
    id: 'english',
    name: 'English',
    displayName: 'English Translation',
  },
  {
    id: 'urdu',
    name: 'Urdu',
    displayName: 'Urdu Translation (اردو)',
  },
  {
    id: 'arabic',
    name: 'Arabic',
    displayName: 'Arabic Text (العربية)',
  },
]

// Book slugs for the two sahih collections
export const HADITH_BOOKS = {
  SAHIH_BUKHARI: 'sahih-bukhari',
  SAHIH_MUSLIM: 'sahih-muslim',
} as const

export type HadithBookSlug = typeof HADITH_BOOKS[keyof typeof HADITH_BOOKS]

// Favorite item data structure
export interface HadithFavoriteData {
  hadithNumber: string
  book: string
  bookSlug: string
  chapter: string
  status: 'Sahih' | 'Hasan' | "Da'eef"
  narrator: string
  hadithEnglish: string
  hadithUrdu: string
  hadithArabic: string
}

