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
    <Card className="rounded-2xl border shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {dua.category}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            aria-label="Copy dua"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Arabic Text */}
        <div>
          <p
            className="text-2xl leading-relaxed font-serif"
            dir="rtl"
            lang="ar"
          >
            {dua.arabic}
          </p>
        </div>

        {/* Transliteration */}
        <div>
          <p className="text-sm font-medium text-foreground italic">
            {dua.transliteration}
          </p>
        </div>

        {/* Translation */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dua.translation}
          </p>
        </div>

        {/* Reference */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Reference:</span> {dua.reference}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

