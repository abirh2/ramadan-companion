import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BookSelector } from '@/components/hadith/BookSelector'

export default function HadithBrowserPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          aria-label="Navigate back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Hadith Browser</h1>
        <p className="text-muted-foreground">
          Explore authentic hadith collections from the major books
        </p>
      </div>

      <BookSelector />
    </div>
  )
}

