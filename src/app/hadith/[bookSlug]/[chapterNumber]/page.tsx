import { HadithList } from '@/components/hadith/HadithList'
import { ChapterHeader } from '@/components/hadith/ChapterHeader'
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <ChapterHeader 
        bookSlug={bookSlug} 
        chapterNumber={chapterNumber}
        bookNameDisplay={bookNameDisplay}
      />
      <HadithList bookSlug={bookSlug} chapterNumber={chapterNumber} />
    </div>
  )
}

