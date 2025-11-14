// Quran and Ayah Types

export interface QuranEdition {
  identifier: string // e.g., 'en.asad', 'quran-uthmani'
  language: string // e.g., 'en', 'ar'
  name: string // e.g., 'Asad', 'القرآن الكريم'
  englishName: string // e.g., 'Muhammad Asad'
  format: 'text' | 'audio'
  type: 'translation' | 'quran' | 'tafsir' | 'transliteration'
  direction: 'ltr' | 'rtl'
}

export interface QuranSurah {
  number: number // Surah number (1-114)
  name: string // Arabic name
  englishName: string // English name
  englishNameTranslation: string // English meaning
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export interface QuranAyah {
  number: number // Global ayah number (1-6236)
  text: string // Arabic or translated text
  edition: QuranEdition
  surah: QuranSurah
  numberInSurah: number // Ayah number within surah
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajda: boolean
}

// Response from AlQuran Cloud API for single edition
export interface AlQuranCloudSingleResponse {
  code: number
  status: string
  data: QuranAyah
}

// Response from AlQuran Cloud API for multiple editions
export interface AlQuranCloudMultiResponse {
  code: number
  status: string
  data: QuranAyah[]
}

// Our formatted response from /api/quran
export interface DailyQuranResponse {
  arabic: QuranAyah
  translation: QuranAyah
  surah: QuranSurah
  ayahNumber: number // Global ayah number
  numberInSurah: number // Ayah number within surah
}

// Translation preference types
export type QuranTranslationId = 
  | 'en.asad'      // Muhammad Asad (default)
  | 'en.sahih'     // Sahih International
  | 'en.pickthall' // Marmaduke Pickthall
  | 'en.yusufali'  // Abdullah Yusuf Ali

export interface QuranTranslation {
  id: QuranTranslationId
  name: string
  translator: string
  description?: string
}

export const QURAN_TRANSLATIONS: QuranTranslation[] = [
  { 
    id: 'en.asad', 
    name: 'Muhammad Asad', 
    translator: 'Muhammad Asad',
    description: 'Contemporary, explanatory translation'
  },
  { 
    id: 'en.sahih', 
    name: 'Sahih International', 
    translator: 'Sahih International',
    description: 'Clear, modern English'
  },
  { 
    id: 'en.pickthall', 
    name: 'Pickthall', 
    translator: 'Marmaduke Pickthall',
    description: 'Classic English translation'
  },
  { 
    id: 'en.yusufali', 
    name: 'Yusuf Ali', 
    translator: 'Abdullah Yusuf Ali',
    description: 'Traditional, widely-used'
  },
]

// Favorite item data structure
export interface QuranFavoriteData {
  ayahNumber: number
  numberInSurah: number
  surahNumber: number
  surahName: string
  arabicText: string
  translationText: string
  translationId: QuranTranslationId
}

// Full Surah Response (for Quran Browser)
export interface FullSurahResponse {
  surah: QuranSurah
  ayahs: AyahPair[]
  translation: QuranTranslationId
}

// Ayah pair (Arabic + Transliteration + Translation)
export interface AyahPair {
  numberInSurah: number
  globalNumber: number
  arabic: QuranAyah
  transliteration: QuranAyah
  translation: QuranAyah
}

// Bookmark data structure
export interface BookmarkData {
  id?: string
  user_id: string
  surah_number: number
  ayah_number: number
  created_at?: string
  updated_at?: string
}

// Juz data (from quranData.ts)
export interface JuzData {
  number: number
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
}

