'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { HadithBook } from '@/types/hadith.types'

interface BookListProps {
  books: HadithBook[]
  searchQuery: string
}

export function BookList({ books, searchQuery }: BookListProps) {
  // Filter books based on search query
  const filteredBooks = books.filter(book => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      book.bookName.toLowerCase().includes(query) ||
      book.writerName.toLowerCase().includes(query) ||
      book.bookSlug.toLowerCase().includes(query)
    )
  })

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hadith collections found matching &quot;{searchQuery}&quot;
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredBooks.map((book) => (
        <Link key={book.id} href={`/hadith/${book.bookSlug}`}>
          <Card className="p-5 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Book Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{book.bookName}</h3>
                <p className="text-sm text-muted-foreground">
                  {book.writerName}
                </p>
                {book.writerDeath && (
                  <p className="text-xs text-muted-foreground mt-1">
                    d. {book.writerDeath}
                  </p>
                )}
              </div>

              {/* Right: Arrow indicator */}
              <div className="flex-shrink-0 text-muted-foreground">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

