/**
 * Quran Audio Utilities
 * 
 * Helper functions for constructing audio URLs and managing reciter preferences.
 * Uses AlQuran Cloud API CDN for audio files.
 */

import type { QuranReciterId, QuranAudioEdition } from '@/types/quran.types'

// List of popular reciters with verified CDN availability
// Note: Only reciters with actual audio files on cdn.islamic.network are included
export const AVAILABLE_RECITERS: QuranAudioEdition[] = [
  { 
    identifier: 'ar.alafasy', 
    name: 'مشاري العفاسي', 
    englishName: 'Alafasy', 
    language: 'ar' 
  },
  { 
    identifier: 'ar.husary', 
    name: 'محمود خليل الحصري', 
    englishName: 'Husary', 
    language: 'ar' 
  },
  { 
    identifier: 'ar.husarymujawwad', 
    name: 'محمود خليل الحصري (المجود)', 
    englishName: 'Husary (Mujawwad)', 
    language: 'ar' 
  },
  { 
    identifier: 'ar.shaatree', 
    name: 'أبو بكر الشاطري', 
    englishName: 'Ash-Shaatree', 
    language: 'ar' 
  },
  { 
    identifier: 'ar.mahermuaiqly', 
    name: 'ماهر المعيقلي', 
    englishName: 'Maher Al Muaiqly', 
    language: 'ar' 
  },
  { 
    identifier: 'ar.minshawi', 
    name: 'محمد صديق المنشاوي', 
    englishName: 'Minshawi', 
    language: 'ar' 
  },
]

export const DEFAULT_RECITER: QuranReciterId = 'ar.alafasy'

/**
 * Construct audio URL for a specific ayah and reciter
 * Uses AlQuran Cloud API CDN endpoint
 * 
 * @param globalAyahNumber - The global ayah number (1-6236)
 * @param reciter - The reciter identifier (default: ar.alafasy)
 * @returns URL to the 128kbps MP3 audio file
 */
export function getAyahAudioUrl(
  globalAyahNumber: number,
  reciter: QuranReciterId = DEFAULT_RECITER
): string {
  // AlQuran Cloud API CDN pattern:
  // https://cdn.islamic.network/quran/audio/128/{reciter}/{ayahNumber}.mp3
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalAyahNumber}.mp3`
}

/**
 * Get low-quality fallback audio URL (for slow connections)
 * 
 * @param globalAyahNumber - The global ayah number (1-6236)
 * @param reciter - The reciter identifier (default: ar.alafasy)
 * @returns URL to the 64kbps MP3 audio file
 */
export function getAyahAudioUrlLowQuality(
  globalAyahNumber: number,
  reciter: QuranReciterId = DEFAULT_RECITER
): string {
  return `https://cdn.islamic.network/quran/audio/64/${reciter}/${globalAyahNumber}.mp3`
}

/**
 * Find reciter by identifier
 * 
 * @param id - The reciter identifier
 * @returns The reciter object if found, undefined otherwise
 */
export function getReciterById(id: QuranReciterId): QuranAudioEdition | undefined {
  return AVAILABLE_RECITERS.find(r => r.identifier === id)
}

