'use client'

import { useState } from 'react'
import { Check, Settings2, Infinity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { ZikrPhrase } from '@/types/zikr.types'

interface ZikrPhraseSelectorProps {
  phrases: ZikrPhrase[]
  currentPhraseId: string
  currentTarget: number | null
  onSelectPhrase: (phraseId: string) => void
  onSetTarget: (target: number | null) => void
}

export function ZikrPhraseSelector({
  phrases,
  currentPhraseId,
  currentTarget,
  onSelectPhrase,
  onSetTarget,
}: ZikrPhraseSelectorProps) {
  const [showTargetSettings, setShowTargetSettings] = useState(false)
  const [customTarget, setCustomTarget] = useState(
    currentTarget?.toString() || ''
  )

  const currentPhrase = phrases.find((p) => p.id === currentPhraseId)
  const hasTarget = currentTarget !== null && currentTarget > 0

  const handleSetDefaultTarget = () => {
    if (currentPhrase) {
      onSetTarget(currentPhrase.defaultTarget)
      setCustomTarget(currentPhrase.defaultTarget.toString())
    }
  }

  const handleSetFreeCount = () => {
    onSetTarget(null)
    setCustomTarget('')
  }

  const handleSetCustomTarget = () => {
    const target = parseInt(customTarget, 10)
    if (!isNaN(target) && target > 0) {
      onSetTarget(target)
    }
  }

  return (
    <Card className="rounded-2xl border shadow-sm p-6">
      <div className="space-y-4">
        {/* Phrase Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Zikr Phrase</label>
          <Select value={currentPhraseId} onValueChange={onSelectPhrase}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {phrases.map((phrase) => (
                <SelectItem key={phrase.id} value={phrase.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{phrase.transliteration}</span>
                    <span className="text-xs text-muted-foreground ml-4">
                      ({phrase.defaultTarget}x)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Settings Toggle */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTargetSettings(!showTargetSettings)}
            className="w-full"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {hasTarget ? `Target: ${currentTarget}` : 'Free Count Mode'}
          </Button>
        </div>

        {/* Target Settings Panel */}
        {showTargetSettings && (
          <div className="space-y-3 pt-2 border-t animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground">
              Set a goal to track your progress, or use free count mode for unlimited counting.
            </p>

            {/* Preset Options */}
            <div className="space-y-2">
              <Button
                variant={hasTarget && currentTarget === currentPhrase?.defaultTarget ? 'default' : 'outline'}
                size="sm"
                onClick={handleSetDefaultTarget}
                className="w-full justify-start"
              >
                {hasTarget && currentTarget === currentPhrase?.defaultTarget && (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Default Target ({currentPhrase?.defaultTarget}x)
              </Button>

              <Button
                variant={!hasTarget ? 'default' : 'outline'}
                size="sm"
                onClick={handleSetFreeCount}
                className="w-full justify-start"
              >
                {!hasTarget && <Check className="w-4 h-4 mr-2" />}
                <Infinity className="w-4 h-4 mr-2" />
                Free Count (No Target)
              </Button>
            </div>

            {/* Custom Target */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Custom Target</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter count"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSetCustomTarget}
                  disabled={!customTarget || parseInt(customTarget) <= 0}
                >
                  Set
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

