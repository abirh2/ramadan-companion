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
        return 'bg-success-muted text-success'
      case 'Hasan':
        return 'bg-teal-muted text-teal'
      case "Da'eef":
        return 'bg-warning-muted text-warning'
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
    <Card variant="grouped" className="gap-0 py-0">
      <CardContent className="space-y-4 p-5 sm:p-6">
        {/* Arabic Text with Copy Button */}
        <div className="flex items-start justify-between gap-4">
          <p
            className="type-arabic flex-1 text-right text-text-primary"
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

        {/* English Translation with Copy Button */}
        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="type-body text-text-secondary">
                {metadata.hadithEnglish}
              </p>
              {metadata.narrator && (
                <p className="type-body-secondary mt-2 italic text-text-secondary">
                  — {metadata.narrator}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyEnglish}
              title="Copy English translation"
              aria-label="Copy English translation"
              className="flex-shrink-0"
            >
              {copiedEnglish ? (
                <Check className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="type-caption flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3 text-text-secondary">
          <span className="font-medium">{metadata.book} {metadata.hadithNumber}</span>
          <span>•</span>
          <span>{metadata.chapter}</span>
          <span>•</span>
          <span className={`inline-block rounded-control-sm px-2 py-0.5 ${getStatusColor(metadata.status)}`}>
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
            className="text-text-secondary"
          >
            <Share2 className="size-4" aria-hidden="true" />
            {shareSuccess ? 'Copied!' : 'Share'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={removing}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Heart className="size-4 fill-current" aria-hidden="true" />
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
