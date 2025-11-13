'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Check, Copy } from 'lucide-react'
import { removeHadithFavorite, type FavoriteItem } from '@/lib/favorites'
import { useAuth } from '@/hooks/useAuth'

interface FavoriteHadithItemProps {
  favorite: FavoriteItem
  onRemove: () => void
}

export function FavoriteHadithItem({ favorite, onRemove }: FavoriteHadithItemProps) {
  const { user } = useAuth()
  const [removing, setRemoving] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [copiedArabic, setCopiedArabic] = useState(false)
  const [copiedEnglish, setCopiedEnglish] = useState(false)

  // Extract metadata
  const metadata = favorite.metadata as {
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

  const handleRemove = async () => {
    if (!user) return

    setRemoving(true)
    const { success } = await removeHadithFavorite(
      user.id,
      metadata.hadithNumber,
      metadata.bookSlug
    )

    if (success) {
      onRemove()
    }
    setRemoving(false)
  }

  const handleShare = async () => {
    const shareText = `${metadata.hadithEnglish}\n\n${metadata.narrator}\n— ${metadata.book} ${metadata.hadithNumber}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${metadata.book} ${metadata.hadithNumber}`,
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
    try {
      await navigator.clipboard.writeText(metadata.hadithArabic)
      setCopiedArabic(true)
      setTimeout(() => setCopiedArabic(false), 2000)
    } catch (err) {
      console.error('Error copying Arabic:', err)
    }
  }

  const handleCopyEnglish = async () => {
    const copyText = `${metadata.hadithEnglish}\n\n${metadata.narrator}\n— ${metadata.book} ${metadata.hadithNumber}`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedEnglish(true)
      setTimeout(() => setCopiedEnglish(false), 2000)
    } catch (err) {
      console.error('Error copying English:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
        <div className="flex items-start justify-between gap-4">
          <p
            className="text-xl md:text-2xl leading-relaxed text-right font-serif flex-1"
            dir="rtl"
            lang="ar"
          >
            {metadata.hadithArabic}
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

        {/* English Translation with Copy Button */}
        <div className="border-t pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-base leading-relaxed text-muted-foreground">
                {metadata.hadithEnglish}
              </p>
              {metadata.narrator && (
                <p className="text-sm text-muted-foreground italic mt-2">
                  — {metadata.narrator}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyEnglish}
              title="Copy English translation"
              className="flex-shrink-0"
            >
              {copiedEnglish ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <span className="font-medium">{metadata.book} {metadata.hadithNumber}</span>
          <span>•</span>
          <span>{metadata.chapter}</span>
          <span>•</span>
          <span className={`inline-block px-2 py-0.5 rounded ${getStatusColor(metadata.status)}`}>
            {metadata.status}
          </span>
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
            disabled={removing}
            className="text-destructive hover:text-destructive ml-auto"
          >
            <Heart className="h-4 w-4 mr-2 fill-current" />
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

