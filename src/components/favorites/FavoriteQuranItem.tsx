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
    <Card variant="grouped" className="gap-0 py-0">
      <CardContent className="space-y-4 p-5 sm:p-6">
        {/* Arabic Text with Copy Button */}
        {metadata.arabicText && (
          <div className="flex items-start justify-between gap-4">
            <p
              className="type-quran-arabic flex-1 text-text-primary"
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
              aria-label="Copy Arabic text"
              className="flex-shrink-0"
            >
              {copiedArabic ? (
                <Check className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}

        {/* Translation with Copy Button */}
        {metadata.translationText && (
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="type-quran-translation text-text-secondary">
                  {metadata.translationText}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyTranslation}
                title="Copy translation"
                aria-label="Copy translation"
                className="flex-shrink-0"
              >
                {copiedTranslation ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="type-caption flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3 text-text-secondary">
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
            className="text-text-secondary"
          >
            <Share2 className="size-4" aria-hidden="true" />
            {shareSuccess ? 'Copied!' : 'Share'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Heart className="size-4 fill-current" aria-hidden="true" />
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
