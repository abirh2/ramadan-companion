'use client'

import Link from 'next/link'
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Smartphone } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ZikrCounter } from '@/components/zikr/ZikrCounter'
import { ZikrPhraseSelector } from '@/components/zikr/ZikrPhraseSelector'
import { DuaList } from '@/components/zikr/DuaList'
import { useZikr } from '@/hooks/useZikr'
import { FeedbackButton } from '@/components/FeedbackButton'

export default function ZikrPage() {
  const {
    state,
    currentPhrase,
    phrases,
    feedbackPrefs,
    progress,
    isGoalReached,
    increment,
    reset,
    selectPhrase,
    setTarget,
    toggleAudioFeedback,
    toggleHapticFeedback,
    loading,
  } = useZikr()

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Zikr & Duas</h1>
            </div>
            <AuthButton />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Zikr & Duas</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Zikr Counter Section */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Tasbeeh Counter</h2>
            <p className="text-sm text-muted-foreground">
              Keep count of your daily zikr and dhikr
            </p>
          </div>

          {/* Counter */}
          <div className="max-w-md mx-auto">
            <ZikrCounter
              count={state.count}
              target={state.target}
              progress={progress}
              isGoalReached={isGoalReached}
              currentPhrase={currentPhrase}
              onIncrement={increment}
            />
          </div>

          {/* Phrase Selector */}
          <div className="max-w-md mx-auto">
            <ZikrPhraseSelector
              phrases={phrases}
              currentPhraseId={state.phraseId}
              currentTarget={state.target}
              onSelectPhrase={selectPhrase}
              onSetTarget={setTarget}
            />
          </div>

          {/* Controls */}
          <div className="max-w-md mx-auto">
            <Card className="rounded-2xl border shadow-sm p-4">
              <div className="space-y-3">
                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={state.count === 0}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Counter
                </Button>

                {/* Feedback Toggles */}
                <div className="flex gap-2">
                  <Button
                    variant={feedbackPrefs.audioEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleAudioFeedback}
                    className="flex-1"
                  >
                    {feedbackPrefs.audioEnabled ? (
                      <Volume2 className="w-4 h-4 mr-2" />
                    ) : (
                      <VolumeX className="w-4 h-4 mr-2" />
                    )}
                    Sound
                  </Button>
                  <Button
                    variant={feedbackPrefs.hapticEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleHapticFeedback}
                    className="flex-1"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Vibration
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Fajr Reset Explanation */}
          <div className="max-w-md mx-auto">
            <Card className="rounded-xl border border-muted bg-muted/20 p-4">
              <div className="flex gap-3">
                <div className="text-2xl">🌙</div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-medium">Daily Reset at Fajr</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your counter automatically resets at Fajr prayer time, marking the beginning
                    of a new Islamic day. This follows the traditional Islamic day boundary.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t" />

        {/* Duas Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Essential Duas</h2>
            <p className="text-sm text-muted-foreground">
              Daily supplications for various occasions
            </p>
          </div>

          <DuaList />
        </section>

        {/* Feedback Button */}
        <FeedbackButton pagePath="/zikr" />
      </main>
    </div>
  )
}

