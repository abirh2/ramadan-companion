'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Copy, Check } from 'lucide-react'
import { removeQuranFavorite } from '@/lib/favorites'
import { useAuth } from '@/hooks/useAuth'
import type { FavoriteItem } from '@/lib/favorites'

interface FavoriteQuranItemProps {
  favorite: FavoriteItem
  onRemove: () => void
}

export function FavoriteQuranItem({ favorite, onRemove }: FavoriteQuranItemProps) {
  const { user } = useAuth()
  const [isRemoving, setIsRemoving] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [copiedArabic, setCopiedArabic] = useState(false)
  const [copiedTranslation, setCopiedTranslation] = useState(false)

  const metadata = favorite.metadata as {
    ayahNumber?: number
    numberInSurah?: number
    surahNumber?: number
    surahName?: string
    arabicText?: string
    translationText?: string
    translationId?: string
  }

  const handleRemove = async () => {
    if (!user || !metadata.ayahNumber) return

    setIsRemoving(true)
    try {
      const { success } = await removeQuranFavorite(user.id, metadata.ayahNumber)
      if (success) {
        onRemove()
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleShare = async () => {
    if (!metadata.translationText || !favorite.title) return

    const shareText = `${metadata.translationText}\n\n— ${favorite.title}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: favorite.title,
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

  const handleCopyArabic = async () => {
    if (!metadata.arabicText) return

    try {
      await navigator.clipboard.writeText(metadata.arabicText)
      setCopiedArabic(true)
      setTimeout(() => setCopiedArabic(false), 2000)
    } catch (err) {
      console.error('Error copying Arabic:', err)
    }
  }

  const handleCopyTranslation = async () => {
    if (!metadata.translationText || !favorite.title) return

    const copyText = `${metadata.translationText}\n\n— ${favorite.title}`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedTranslation(true)
      setTimeout(() => setCopiedTranslation(false), 2000)
    } catch (err) {
      console.error('Error copying translation:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* Arabic Text with Copy Button */}
        {metadata.arabicText && (
          <div className="flex items-start justify-between gap-4">
            <p
              className="text-xl md:text-2xl leading-relaxed text-right font-serif flex-1"
              dir="rtl"
              lang="ar"
            >
              {metadata.arabicText}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyArabic}
              title="Copy Arabic text"
              className="flex-shrink-0"
            >
              {copiedArabic ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Translation with Copy Button */}
        {metadata.translationText && (
          <div className="border-t pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {metadata.translationText}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyTranslation}
                title="Copy translation"
                className="flex-shrink-0"
              >
                {copiedTranslation ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <span className="font-medium">{favorite.title}</span>
          <span>•</span>
          <span>Saved {formatDate(favorite.created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-muted-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {shareSuccess ? 'Copied!' : 'Share'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-destructive hover:text-destructive ml-auto"
          >
            <Heart className="h-4 w-4 mr-2 fill-current" />
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

