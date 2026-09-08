/**
 * AyahAudioPlayer Component
 * 
 * Audio player for individual ayah recitation.
 * Features: play/pause toggle, loading states, error handling.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Loader2, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAyahAudioUrl } from '@/lib/quranAudio'
import type { QuranReciterId } from '@/types/quran.types'

interface AyahAudioPlayerProps {
  globalAyahNumber: number
  reciter: QuranReciterId
  className?: string
}

export function AyahAudioPlayer({ globalAyahNumber, reciter, className }: AyahAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const userInitiatedRef = useRef(false) // Track if user clicked play

  const audioUrl = getAyahAudioUrl(globalAyahNumber, reciter)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.preload = 'none' // Don't preload to save bandwidth
    
    // Event handlers
    const handleEnded = () => {
      setIsPlaying(false)
      setIsLoading(false)
      userInitiatedRef.current = false
    }
    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
      setIsPlaying(false)
      userInitiatedRef.current = false
    }
    const handleLoadStart = () => {
      // Only show loading if user explicitly clicked play
      if (userInitiatedRef.current) {
        setIsLoading(true)
      }
    }
    const handleCanPlay = () => {
      if (userInitiatedRef.current) {
        setIsLoading(false)
      }
    }
    
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    
    audioRef.current = audio
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
      userInitiatedRef.current = false
    }
  }, [audioUrl])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setIsLoading(false)
      userInitiatedRef.current = false
    } else {
      try {
        setHasError(false)
        userInitiatedRef.current = true // Mark as user-initiated
        setIsLoading(true)
        await audioRef.current.play()
        setIsPlaying(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Audio playback error:', error)
        setHasError(true)
        setIsLoading(false)
        userInitiatedRef.current = false
      }
    }
  }

  // Shared visual treatment matching the ayah action group: an icon toggle
  // with a 44x44 touch target. State is conveyed by icon plus accessible text,
  // never by color alone, and never by flashing/high-motion animation.
  const targetClasses = 'min-h-11 min-w-11'

  if (hasError) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        className={cn(targetClasses, 'text-destructive', className)}
        title="Audio unavailable"
        aria-label="Audio unavailable"
      >
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Audio unavailable</span>
      </Button>
    )
  }

  const label = isLoading
    ? 'Loading recitation'
    : isPlaying
      ? 'Pause recitation'
      : 'Play recitation'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={togglePlay}
      disabled={isLoading}
      className={cn(targetClasses, className)}
      title={label}
      aria-label={label}
    >
      {isLoading ? (
        <>
          {/* Animated spinner for motion; static indicator under reduced-motion */}
          <Loader2
            className="h-4 w-4 animate-spin motion-reduce:hidden"
            aria-hidden="true"
          />
          <Loader
            className="hidden h-4 w-4 motion-reduce:block"
            aria-hidden="true"
          />
        </>
      ) : isPlaying ? (
        <Pause className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Play className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

