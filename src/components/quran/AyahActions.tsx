'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Heart, Share2, Bookmark, Check } from 'lucide-react'
import { useQuranBrowserFavorites } from '@/hooks/useQuranBrowserFavorites'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
import { useAuth } from '@/hooks/useAuth'

interface AyahActionsProps {
  surahNumber: number
  surahName: string
  ayahNumber: number
  globalNumber: number
  arabicText: string
  translationText: string
}

export function AyahActions({
  surahNumber,
  surahName,
  ayahNumber,
  globalNumber,
  arabicText,
  translationText,
}: AyahActionsProps) {
  const { user } = useAuth()
  const { isFavorited, addFavorite, removeFavorite } = useQuranBrowserFavorites()
  const { saveBookmark, deleteBookmark, getBookmark } = useQuranBookmarks()
  const [copied, setCopied] = useState(false)

  const isFav = isFavorited(globalNumber)
  
  // Check if this specific ayah is bookmarked
  const bookmark = getBookmark(surahNumber)
  const isBookmarked = bookmark?.ayah_number === ayahNumber

  const handleCopy = async () => {
    const textToCopy = `${arabicText}\n\n${translationText}\n\n— Quran ${surahNumber}:${ayahNumber} (${surahName})`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleFavorite = async () => {
    if (isFav) {
      await removeFavorite(globalNumber)
    } else {
      await addFavorite({
        ayahNumber: globalNumber,
        numberInSurah: ayahNumber,
        surahNumber,
        surahName,
        arabicText,
        translationText,
        translationId: 'en.asad', // TODO: Get from context
      })
    }
  }

  const handleBookmark = async () => {
    if (isBookmarked) {
      // Remove bookmark if clicking on the currently bookmarked ayah
      await deleteBookmark(surahNumber)
    } else {
      // Save new bookmark (overwrites any previous bookmark in this surah)
      await saveBookmark(surahNumber, ayahNumber)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Quran ${surahNumber}:${ayahNumber}`,
      text: `${arabicText}\n\n${translationText}`,
      url: `${window.location.origin}/quran/${surahNumber}?ayah=${ayahNumber}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(shareData.url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </>
        )}
      </Button>

      <Button
        variant={isFav ? 'default' : 'outline'}
        size="sm"
        onClick={handleFavorite}
      >
        <Heart className={`h-4 w-4 mr-2 ${isFav ? 'fill-current' : ''}`} />
        {isFav ? 'Favorited' : 'Favorite'}
      </Button>

      <Button
        variant={isBookmarked ? 'default' : 'outline'}
        size="sm"
        onClick={handleBookmark}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  )
}

