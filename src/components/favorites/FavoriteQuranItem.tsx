'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Trash2 } from 'lucide-react'
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

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Arabic Text */}
        {metadata.arabicText && (
          <p
            className="text-xl md:text-2xl leading-relaxed text-right font-serif"
            dir="rtl"
            lang="ar"
          >
            {metadata.arabicText}
          </p>
        )}

        {/* Translation */}
        {metadata.translationText && (
          <div className="border-t pt-4">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              {metadata.translationText}
            </p>
          </div>
        )}

        {/* Footer: Reference + Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="space-y-1">
            <p className="text-sm font-medium">{favorite.title}</p>
            <p className="text-xs text-muted-foreground">
              Saved {new Date(favorite.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              title="Share ayah"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isRemoving}
              title="Remove from favorites"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isRemoving ? (
                <Heart className="h-4 w-4 fill-current animate-pulse" />
              ) : (
                <Heart className="h-4 w-4 fill-current" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Success Message */}
        {shareSuccess && (
          <div className="text-center text-sm text-green-600 dark:text-green-400">
            ✓ Copied to clipboard
          </div>
        )}
      </CardContent>
    </Card>
  )
}

