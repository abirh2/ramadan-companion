/**
 * AyahAudioPlayer Component
 * 
 * Audio player for individual ayah recitation.
 * Features: play/pause toggle, loading states, error handling.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, Loader2 } from 'lucide-react'
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

  if (hasError) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={className}
        title="Audio unavailable"
        aria-label="Audio unavailable"
      >
        <Volume2 className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
        Audio Error
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={togglePlay}
      disabled={isLoading}
      className={className}
      aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
          Loading...
        </>
      ) : isPlaying ? (
        <>
          <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
          Pause
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" aria-hidden="true" />
          Listen
        </>
      )}
    </Button>
  )
}

