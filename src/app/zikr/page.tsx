'use client'

import Link from 'next/link'
import { ArrowLeft, Loader2, Moon, RotateCcw, Smartphone, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ZikrCounter } from '@/components/zikr/ZikrCounter'
import { ZikrPhraseSelector } from '@/components/zikr/ZikrPhraseSelector'
import { DuaList } from '@/components/zikr/DuaList'
import { AsmaAlHusnaList } from '@/components/zikr/AsmaAlHusnaList'
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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex min-h-11 items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="type-nav">Back to Home</span>
        </Link>
        <h1 className="type-page-title text-text-primary">Zikr</h1>
      </header>

      {loading ? (
        <div className="flex min-h-[32rem] items-center justify-center" role="status" aria-live="polite">
          <div className="space-y-3 text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-teal" aria-hidden="true" />
            <p className="type-body-secondary text-text-secondary">Preparing your counter…</p>
          </div>
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-2xl" aria-label="Zikr counter">
            <ZikrCounter
              count={state.count}
              target={state.target}
              progress={progress}
              isGoalReached={isGoalReached}
              currentPhrase={currentPhrase}
              onIncrement={increment}
            />

            <div className="mt-4">
              <ZikrPhraseSelector
                phrases={phrases}
                currentPhraseId={state.phraseId}
                currentTarget={state.target}
                onSelectPhrase={selectPhrase}
                onSetTarget={setTarget}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1" aria-label="Counter preferences">
              <Button
                variant="ghost"
                onClick={reset}
                disabled={state.count === 0}
                className="text-text-secondary"
                aria-label={`Reset ${currentPhrase.transliteration} count from ${state.count} to zero`}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
              <Button
                variant="ghost"
                onClick={toggleAudioFeedback}
                aria-pressed={feedbackPrefs.audioEnabled}
                className="min-h-11 text-text-secondary"
              >
                {feedbackPrefs.audioEnabled ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
                Sound {feedbackPrefs.audioEnabled ? 'on' : 'off'}
              </Button>
              <Button
                variant="ghost"
                onClick={toggleHapticFeedback}
                aria-pressed={feedbackPrefs.hapticEnabled}
                className="min-h-11 text-text-secondary"
              >
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Haptics {feedbackPrefs.hapticEnabled ? 'on' : 'off'}
              </Button>
            </div>

            <div className="mt-4 flex items-start justify-center gap-2 px-3 text-text-tertiary">
              <Moon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="type-caption max-w-md text-center">
                Your count resets at Fajr, marking the start of a new Islamic day.
              </p>
            </div>
          </section>

          <div className="my-10 border-t border-border-subtle" />

          <section className="space-y-6" aria-labelledby="duas-title">
            <div className="text-center">
              <h2 id="duas-title" className="type-section-title mx-auto text-text-primary">Essential Duas</h2>
              <p className="type-body-secondary mt-2 text-text-secondary">Daily supplications for various occasions</p>
            </div>
            <DuaList />
          </section>

          <div className="my-10 border-t border-border-subtle" />

          <section className="space-y-6" aria-labelledby="names-title">
            <div className="text-center">
              <h2 id="names-title" className="type-section-title mx-auto text-text-primary">99 Names of Allah</h2>
              <p className="type-body-secondary mt-2 text-text-secondary">Asma ul-Husna — The Most Beautiful Names</p>
            </div>
            <AsmaAlHusnaList />
          </section>
        </>
      )}

      <FeedbackButton pagePath="/zikr" />
    </div>
  )
}
