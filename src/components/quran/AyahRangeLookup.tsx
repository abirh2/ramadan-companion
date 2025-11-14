'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface AyahRangeLookupProps {
  surahNumber: number
  totalAyahs: number
}

export function AyahRangeLookup({ surahNumber, totalAyahs }: AyahRangeLookupProps) {
  const router = useRouter()
  const [ayahInput, setAyahInput] = useState('')

  const handleGo = () => {
    const ayahNum = parseInt(ayahInput)
    
    if (isNaN(ayahNum) || ayahNum < 1 || ayahNum > totalAyahs) {
      alert(`Please enter a valid ayah number between 1 and ${totalAyahs}`)
      return
    }

    router.push(`/quran/${surahNumber}?ayah=${ayahNum}`)
    
    // Scroll to ayah after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0 })
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGo()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder={`Go to ayah (1-${totalAyahs})`}
        value={ayahInput}
        onChange={(e) => setAyahInput(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-40"
        min={1}
        max={totalAyahs}
      />
      <Button onClick={handleGo} size="sm">
        <Search className="h-4 w-4 mr-2" />
        Go
      </Button>
    </div>
  )
}

