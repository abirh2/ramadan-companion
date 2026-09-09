import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BookSelector } from '@/components/hadith/BookSelector'

export default function HadithBrowserPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <Link 
          href="/more"
          className="type-nav mb-3 inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to More"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <h1 className="type-page-title text-text-primary">Hadith</h1>
      </header>

      <BookSelector />
    </div>
  )
}
