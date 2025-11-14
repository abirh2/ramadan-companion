import { getSurahByNumber, isValidSurahNumber } from '@/lib/quranData'
import { SurahReader } from '@/components/quran/SurahReader'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ surahNumber: string }>
  searchParams: Promise<{ ayah?: string }>
}

export default async function SurahPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const surahNumber = parseInt(resolvedParams.surahNumber)

  // Validate surah number
  if (isNaN(surahNumber) || !isValidSurahNumber(surahNumber)) {
    notFound()
  }

  const surahMetadata = getSurahByNumber(surahNumber)
  if (!surahMetadata) {
    notFound()
  }

  const initialAyah = resolvedSearchParams.ayah ? parseInt(resolvedSearchParams.ayah) : undefined

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <SurahReader 
        surahNumber={surahNumber} 
        surahMetadata={surahMetadata}
        initialAyah={initialAyah}
      />
    </div>
  )
}

