'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart } from 'lucide-react'
import { LoginModal } from '@/components/auth/LoginModal'
import { useQuranFavorites } from '@/hooks/useQuranFavorites'
import { useQuranOfTheDay } from '@/hooks/useQuranOfTheDay'
import { useHadithFavorites } from '@/hooks/useHadithFavorites'
import { useHadithOfTheDay } from '@/hooks/useHadithOfTheDay'
import type { QuranFavoriteData } from '@/types/quran.types'
import type { HadithFavoriteData } from '@/types/hadith.types'

type ReflectionKind = 'quran' | 'hadith'

export function DailyReflection() {
  const [selected, setSelected] = useState<ReflectionKind>('quran')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const quran = useQuranOfTheDay()
  const hadith = useHadithOfTheDay()

  const quranFavoriteData: QuranFavoriteData | null = useMemo(() => {
    if (!quran.arabic || !quran.translation || !quran.surah || !quran.ayahNumber || !quran.numberInSurah) return null
    return {
      ayahNumber: quran.ayahNumber,
      numberInSurah: quran.numberInSurah,
      surahNumber: quran.surah.number,
      surahName: quran.surah.englishName,
      arabicText: quran.arabic.text,
      translationText: quran.translation.text,
      translationId: quran.translation.edition.identifier as QuranFavoriteData['translationId'],
    }
  }, [quran.arabic, quran.translation, quran.surah, quran.ayahNumber, quran.numberInSurah])

  const hadithFavoriteData: HadithFavoriteData | null = useMemo(() => {
    if (!hadith.hadithEnglish || !hadith.hadithUrdu || !hadith.hadithArabic || !hadith.narrator || !hadith.book || !hadith.bookSlug || !hadith.chapter || !hadith.hadithNumber || !hadith.status) return null
    return {
      hadithNumber: hadith.hadithNumber,
      book: hadith.book,
      bookSlug: hadith.bookSlug,
      chapter: hadith.chapter,
      status: hadith.status,
      narrator: hadith.narrator,
      hadithEnglish: hadith.hadithEnglish,
      hadithUrdu: hadith.hadithUrdu,
      hadithArabic: hadith.hadithArabic,
    }
  }, [hadith.hadithEnglish, hadith.hadithUrdu, hadith.hadithArabic, hadith.narrator, hadith.book, hadith.bookSlug, hadith.chapter, hadith.hadithNumber, hadith.status])

  const quranFavorite = useQuranFavorites(quranFavoriteData)
  const hadithFavorite = useHadithFavorites(hadithFavoriteData)
  const favorite = selected === 'quran' ? quranFavorite : hadithFavorite

  async function handleFavorite() {
    if (favorite.requiresAuth) {
      setShowLoginModal(true)
      return
    }
    await favorite.toggleFavorite()
  }

  const loading = selected === 'quran' ? quran.loading : hadith.loading
  const error = selected === 'quran' ? quran.error : hadith.error
  const hadithTranslation = hadith.selectedLanguage === 'urdu' ? hadith.hadithUrdu : hadith.hadithEnglish

  return (
    <>
      <section className="border-t border-border-subtle pt-8" aria-labelledby="reflection-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="reflection-heading" className="type-section-title">Today&apos;s reflection</h2>
            <p className="type-caption mt-0.5 text-text-secondary">A moment to read and return to</p>
          </div>
          <button
            type="button"
            onClick={handleFavorite}
            disabled={favorite.isLoading || loading || Boolean(error)}
            className="inline-flex size-touch shrink-0 items-center justify-center rounded-control text-text-secondary hover:bg-surface-grouped hover:text-text-primary disabled:opacity-45"
            aria-label={favorite.isFavorited ? `Remove ${selected} reflection from favorites` : `Add ${selected} reflection to favorites`}
          >
            <Heart className={`size-5 ${favorite.isFavorited ? 'fill-current text-teal' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-control bg-surface-grouped p-1" role="group" aria-label="Choose reflection type">
          {(['quran', 'hadith'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setSelected(kind)}
              aria-pressed={selected === kind}
              className={`type-nav min-h-touch rounded-control-sm px-4 transition-colors ${
                selected === kind
                  ? 'bg-surface-primary text-text-primary shadow-hairline'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {kind === 'quran' ? 'Quran' : 'Hadith'}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {loading && (
            <div className="min-h-64 space-y-4 py-5" role="status" aria-label={`Loading daily ${selected}`}>
              <div className="ml-auto h-8 w-5/6 animate-pulse rounded-control bg-surface-grouped" />
              <div className="ml-auto h-8 w-3/4 animate-pulse rounded-control bg-surface-grouped" />
              <div className="mt-8 h-5 w-full animate-pulse rounded-control bg-surface-grouped" />
              <div className="h-5 w-4/5 animate-pulse rounded-control bg-surface-grouped" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-grouped bg-destructive-muted p-4" role="alert">
              <p className="type-body font-medium text-text-primary">This reflection couldn&apos;t be loaded.</p>
              <p className="type-caption mt-1 text-text-secondary">Try again later or browse the full library.</p>
            </div>
          )}

          {!loading && !error && selected === 'quran' && quran.arabic && quran.translation && quran.surah && (
            <article aria-label="Quran reflection of the day">
              <p className="type-quran-arabic text-text-primary" lang="ar" dir="rtl">
                {quran.arabic.text}
              </p>
              <p className="type-quran-translation mt-5 text-text-secondary">
                {quran.translation.text}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <p className="type-caption text-text-secondary">
                  Surah {quran.surah.englishName} · {quran.surah.number}:{quran.numberInSurah}
                </p>
                <Link href="/quran-hadith" className="type-nav inline-flex min-h-touch items-center gap-1.5 rounded-control px-2 text-teal hover:bg-teal-muted">
                  Continue reading
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}

          {!loading && !error && selected === 'hadith' && hadith.hadithArabic && hadithTranslation && (
            /* The detailed-reading link carries the active reading-language so the
               destination presents hadith text in the same value that was active
               here at the moment of activation (Requirement 11.3). */
            <article aria-label="Hadith reflection of the day">
              <p className="type-arabic text-right text-text-primary" lang="ar" dir="rtl">
                {hadith.hadithArabic}
              </p>
              <p className="type-body mt-5 text-text-secondary">{hadithTranslation}</p>
              {hadith.narrator && <p className="type-caption mt-3 text-text-tertiary">{hadith.narrator}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <p className="type-caption text-text-secondary">
                  {hadith.book} {hadith.hadithNumber}
                  {hadith.status ? ` · ${hadith.status}` : ''}
                </p>
                <Link href={`/quran-hadith?lang=${hadith.selectedLanguage}`} className="type-nav inline-flex min-h-touch items-center gap-1.5 rounded-control px-2 text-teal hover:bg-teal-muted">
                  Continue reading
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
