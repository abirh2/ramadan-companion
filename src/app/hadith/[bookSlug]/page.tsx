import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ChapterSelector } from '@/components/hadith/ChapterSelector'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ bookSlug: string }>
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

export default async function BookChaptersPage({ params }: PageProps) {
  const resolvedParams = await params
  const { bookSlug } = resolvedParams

  // Validate book slug
  if (!VALID_BOOK_SLUGS.includes(bookSlug)) {
    notFound()
  }

  // Format book name for display
  const bookNameDisplay = bookSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link 
          href="/hadith" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          aria-label="Navigate back to hadith browser"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Back to Collections</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{bookNameDisplay}</h1>
        <p className="text-muted-foreground">
          Browse chapters and explore hadiths
        </p>
      </div>

      <ChapterSelector bookSlug={bookSlug} />
    </div>
  )
}

