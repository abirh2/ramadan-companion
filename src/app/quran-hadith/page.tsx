'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Heart, Share2, Loader2, ScrollText, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuranOfTheDay } from '@/hooks/useQuranOfTheDay'
import { useQuranFavorites } from '@/hooks/useQuranFavorites'
import { useHadithOfTheDay } from '@/hooks/useHadithOfTheDay'
import { useHadithFavorites } from '@/hooks/useHadithFavorites'
import { LoginModal } from '@/components/auth/LoginModal'
import { TranslationSelector } from '@/components/quran/TranslationSelector'
import { LanguageSelector } from '@/components/hadith/LanguageSelector'
import { FeedbackButton } from '@/components/FeedbackButton'
import type { QuranFavoriteData } from '@/types/quran.types'
import type { HadithFavoriteData } from '@/types/hadith.types'

export default function QuranHadithPage() {
  const { 
    arabic, 
    translation, 
    surah, 
    ayahNumber, 
    numberInSurah, 
    selectedTranslation,
    loading, 
    error,
    setTranslation
  } = useQuranOfTheDay()

  const {
    hadithEnglish,
    hadithUrdu,
    hadithArabic,
    narrator,
    book,
    bookSlug,
    bookWriter,
    chapter,
    chapterArabic,
    hadithNumber,
    status,
    selectedLanguage,
    loading: hadithLoading,
    error: hadithError,
    setLanguage,
  } = useHadithOfTheDay()

  const [shareSuccess, setShareSuccess] = useState(false)
  const [hadithShareSuccess, setHadithShareSuccess] = useState(false)
  const [copiedQuranArabic, setCopiedQuranArabic] = useState(false)
  const [copiedQuranTranslation, setCopiedQuranTranslation] = useState(false)
  const [copiedHadithEnglish, setCopiedHadithEnglish] = useState(false)
  const [copiedHadithArabic, setCopiedHadithArabic] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Prepare Quran favorite data
  const favoriteData: QuranFavoriteData | null = useMemo(() => {
    if (!arabic || !translation || !surah || !ayahNumber || !numberInSurah) {
      return null
    }
    return {
      ayahNumber,
      numberInSurah,
      surahNumber: surah.number,
      surahName: surah.englishName,
      arabicText: arabic.text,
      translationText: translation.text,
      translationId: translation.edition.identifier as QuranFavoriteData['translationId'],
    }
  }, [arabic, translation, surah, ayahNumber, numberInSurah])

  // Prepare Hadith favorite data
  const hadithFavoriteData: HadithFavoriteData | null = useMemo(() => {
    if (
      !hadithEnglish ||
      !hadithUrdu ||
      !hadithArabic ||
      !narrator ||
      !book ||
      !bookSlug ||
      !chapter ||
      !hadithNumber ||
      !status
    ) {
      return null
    }
    return {
      hadithNumber,
      book,
      bookSlug,
      chapter,
      status,
      narrator,
      hadithEnglish,
      hadithUrdu,
      hadithArabic,
    }
  }, [hadithEnglish, hadithUrdu, hadithArabic, narrator, book, bookSlug, chapter, hadithNumber, status])

  const { isFavorited, isLoading: favLoading, toggleFavorite, requiresAuth } = useQuranFavorites(favoriteData)
  const {
    isFavorited: isHadithFavorited,
    isLoading: hadithFavLoading,
    toggleFavorite: toggleHadithFavorite,
    requiresAuth: hadithRequiresAuth,
  } = useHadithFavorites(hadithFavoriteData)

  // Handle Quran share/copy to clipboard
  const handleShare = async () => {
    if (!arabic || !translation || !surah) return

    const shareText = `${translation.text}\n\n— Quran ${surah.englishName} (${surah.number}:${numberInSurah})`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Quran ${surah.englishName} ${surah.number}:${numberInSurah}`,
          text: shareText,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  // Handle copy Quran Arabic
  const handleCopyQuranArabic = async () => {
    if (!arabic) return

    try {
      await navigator.clipboard.writeText(arabic.text)
      setCopiedQuranArabic(true)
      setTimeout(() => setCopiedQuranArabic(false), 2000)
    } catch (err) {
      console.error('Error copying Quran Arabic:', err)
    }
  }

  // Handle copy Quran translation
  const handleCopyQuranTranslation = async () => {
    if (!translation || !surah) return

    const copyText = `${translation.text}\n\n— Quran ${surah.englishName} (${surah.number}:${numberInSurah})`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedQuranTranslation(true)
      setTimeout(() => setCopiedQuranTranslation(false), 2000)
    } catch (err) {
      console.error('Error copying Quran translation:', err)
    }
  }

  // Handle Hadith share/copy to clipboard
  const handleHadithShare = async () => {
    if (!hadithEnglish || !narrator || !book || !hadithNumber) return

    const shareText = `${hadithEnglish}\n\n${narrator}\n— ${book} ${hadithNumber}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${book} ${hadithNumber}`,
          text: shareText,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        setHadithShareSuccess(true)
        setTimeout(() => setHadithShareSuccess(false), 2000)
      }
    } catch (err) {
      console.error('Error sharing hadith:', err)
    }
  }

  // Handle copy English hadith
  const handleCopyHadithEnglish = async () => {
    if (!hadithEnglish || !narrator || !book || !hadithNumber) return

    const copyText = `${hadithEnglish}\n\n${narrator}\n— ${book} ${hadithNumber}`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedHadithEnglish(true)
      setTimeout(() => setCopiedHadithEnglish(false), 2000)
    } catch (err) {
      console.error('Error copying English hadith:', err)
    }
  }

  // Handle copy Arabic hadith
  const handleCopyHadithArabic = async () => {
    if (!hadithArabic || !book || !hadithNumber) return

    const copyText = `${hadithArabic}\n\n— ${book} ${hadithNumber}`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedHadithArabic(true)
      setTimeout(() => setCopiedHadithArabic(false), 2000)
    } catch (err) {
      console.error('Error copying Arabic hadith:', err)
    }
  }

  // Get selected language text for hadith
  const getSelectedHadithText = () => {
    switch (selectedLanguage) {
      case 'urdu':
        return hadithUrdu
      case 'english':
      default:
        return hadithEnglish
    }
  }

  // Status badge color
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'Sahih':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'Hasan':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case "Da'eef":
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold">Daily Reminders</h1>
        <p className="text-muted-foreground mt-2">Quran and Hadith of the Day</p>
      </div>

      {/* Content */}
        {/* Quran of the Day Section */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Quran of the Day</CardTitle>
                  {!loading && surah && (
                    <CardDescription>
                      Surah {surah.englishName} ({surah.number}:{numberInSurah})
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  disabled={loading || !!error}
                  title="Share ayah"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loading || !!error || favLoading}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={async () => {
                    if (requiresAuth) {
                      setShowLoginModal(true)
                      return
                    }
                    await toggleFavorite()
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} 
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load daily ayah.</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later or check your internet connection.
                </p>
              </div>
            )}

            {!loading && !error && arabic && translation && surah && (
              <>
                {/* Arabic Text with Copy Button */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-2xl md:text-3xl leading-relaxed text-right font-serif flex-1"
                      dir="rtl"
                      lang="ar"
                    >
                      {arabic.text}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopyQuranArabic}
                      disabled={loading}
                      title="Copy Arabic text"
                      className="mt-1 flex-shrink-0"
                    >
                      {copiedQuranArabic ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Translation with Copy Button */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                        {translation.text}
                      </p>
                      <p className="text-sm text-muted-foreground italic mt-2">
                        — {translation.edition.englishName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopyQuranTranslation}
                      disabled={loading}
                      title="Copy translation"
                      className="flex-shrink-0"
                    >
                      {copiedQuranTranslation ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Surah Info Card */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">About this Surah</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{surah.englishName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Meaning</p>
                      <p className="font-medium">{surah.englishNameTranslation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revelation</p>
                      <p className="font-medium">{surah.revelationType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ayahs</p>
                      <p className="font-medium">{surah.numberOfAyahs}</p>
                    </div>
                  </div>
                </div>

                {/* Translation Selector */}
                <div className="border-t pt-4">
                  <TranslationSelector
                    currentTranslation={selectedTranslation}
                    onTranslationChange={setTranslation}
                    disabled={loading}
                  />
                </div>

                {/* Share Success Message */}
                {shareSuccess && (
                  <div className="text-center text-sm text-green-600 dark:text-green-400">
                    ✓ Copied to clipboard
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Hadith of the Day Section */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Hadith of the Day</CardTitle>
                  {!hadithLoading && book && (
                    <CardDescription>
                      {book} {hadithNumber}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHadithShare}
                  disabled={hadithLoading || !!hadithError}
                  title="Share hadith"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={hadithLoading || !!hadithError || hadithFavLoading}
                  title={isHadithFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={async () => {
                    if (hadithRequiresAuth) {
                      setShowLoginModal(true)
                      return
                    }
                    await toggleHadithFavorite()
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${isHadithFavorited ? 'fill-current text-red-500' : ''}`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {hadithLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {hadithError && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load daily hadith.</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later or check your internet connection.
                </p>
              </div>
            )}

            {!hadithLoading && !hadithError && hadithArabic && (
              <>
                {/* Arabic Text with Copy Button */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-2xl md:text-3xl leading-relaxed text-right font-serif flex-1"
                      dir="rtl"
                      lang="ar"
                    >
                      {hadithArabic}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopyHadithArabic}
                      disabled={hadithLoading}
                      title="Copy Arabic text"
                      className="mt-1 flex-shrink-0"
                    >
                      {copiedHadithArabic ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Selected Language Translation with Copy Button */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                        {getSelectedHadithText()}
                      </p>
                      {narrator && (
                        <p className="text-sm text-muted-foreground italic mt-2">— {narrator}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopyHadithEnglish}
                      disabled={hadithLoading || selectedLanguage !== 'english'}
                      title="Copy English translation"
                      className="flex-shrink-0"
                    >
                      {copiedHadithEnglish ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Hadith Info Card */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">About this Hadith</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Book</p>
                      <p className="font-medium">{book}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hadith Number</p>
                      <p className="font-medium">{hadithNumber}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Chapter</p>
                      <p className="font-medium">{chapter}</p>
                      {chapterArabic && (
                        <p className="text-sm text-right font-serif mt-1" dir="rtl" lang="ar">
                          {chapterArabic}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(status || '')}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Source Attribution */}
                  <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Source:</span> HadithAPI ({book} — {bookWriter})
                    </p>
                    <p className="italic">
                      * Hadith numbering follows HadithAPI edition
                    </p>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="border-t pt-4">
                  <LanguageSelector
                    value={selectedLanguage}
                    onValueChange={setLanguage}
                    disabled={hadithLoading}
                  />
                </div>

                {/* Share Success Message */}
                {hadithShareSuccess && (
                  <div className="text-center text-sm text-green-600 dark:text-green-400">
                    ✓ Copied to clipboard
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

      {/* Feedback Button */}
      <FeedbackButton pagePath="/quran-hadith" />

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}

