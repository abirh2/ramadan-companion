'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Dua } from '@/types/zikr.types'

interface DuaCardProps {
  dua: Dua
}

export function DuaCard({ dua }: DuaCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\nReference: ${dua.reference}`
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Card variant="grouped" className="h-full gap-0 py-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="type-caption font-semibold text-text-secondary">
              {dua.category}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="min-w-touch"
            aria-label="Copy dua"
          >
            {copied ? (
              <Check className="size-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pb-5">
        {/* Arabic Text */}
        <div>
          <p
            className="type-arabic text-text-primary"
            dir="rtl"
            lang="ar"
          >
            {dua.arabic}
          </p>
        </div>

        {/* Transliteration */}
        <div>
          <p className="type-body-secondary font-medium italic text-text-primary">
            {dua.transliteration}
          </p>
        </div>

        {/* Translation */}
        <div>
          <p className="type-body-secondary text-text-secondary">
            {dua.translation}
          </p>
        </div>

        {/* Reference */}
        <div className="border-t border-border-subtle pt-3">
          <p className="type-caption text-text-secondary">
            <span className="font-medium">Reference:</span> {dua.reference}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
