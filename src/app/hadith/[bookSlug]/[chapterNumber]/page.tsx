import { Suspense } from 'react'
import { HadithList } from '@/components/hadith/HadithList'
import { ReaderHeader } from '@/components/hadith/ReaderHeader'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ bookSlug: string; chapterNumber: string }>
}

// Valid book slugs based on HadithAPI
// Note: Musnad Ahmad and Al-Silsila Sahiha excluded (no hadith content in API)
const VALID_BOOK_SLUGS = [
  'sahih-bukhari',
  'sahih-muslim',
  'al-tirmidhi',
  'abu-dawood',
  'ibn-e-majah',
  'sunan-nasai',
  'mishkat',
]

export default async function ChapterHadithsPage({ params }: PageProps) {
  const resolvedParams = await params
  const { bookSlug, chapterNumber } = resolvedParams

  // Validate book slug
  if (!VALID_BOOK_SLUGS.includes(bookSlug)) {
    notFound()
  }

  // Validate chapter number is numeric
  if (!/^\d+$/.test(chapterNumber)) {
    notFound()
  }

  // Format book name for display
  const bookNameDisplay = bookSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Reading region sits on the --canvas token (warm ivory in light / tinted
  // midnight in dark), never teal — expressed via the semantic `bg-canvas`
  // utility, mirroring the Quran reader (SurahReader). ReaderHeader and the
  // restyled HadithList compose on this canvas; the hooks own the
  // token-styled loading / error / empty / offline states.
  return (
    <div className="bg-canvas">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ReaderHeader
          bookSlug={bookSlug}
          chapterNumber={chapterNumber}
          bookNameDisplay={bookNameDisplay}
        />
        {/* HadithList reads the `?lang=` param via useSearchParams, which the
            App Router requires to sit inside a Suspense boundary. */}
        <Suspense
          fallback={
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
            </div>
          }
        >
          <HadithList bookSlug={bookSlug} chapterNumber={chapterNumber} />
        </Suspense>
      </div>
    </div>
  )
}

