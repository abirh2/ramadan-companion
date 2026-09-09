'use client'

import type { HadithBook } from '@/types/hadith.types'
import { CollectionRow } from './CollectionRow'

interface BookListProps {
  books: HadithBook[]
  searchQuery: string
}

export function BookList({ books, searchQuery }: BookListProps) {
  // Filter books based on search query (case-insensitive substring predicate,
  // preserved verbatim from the pre-redesign implementation).
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

  // One grouped surface of CollectionRow items. Rows are separated by hairline
  // dividers, with no divider before the first row or after the last. Collections
  // render in the order the data source returns.
  return (
    <div className="surface-grouped overflow-hidden">
      {filteredBooks.map((book, index) => (
        <div
          key={book.id}
          className={index === 0 ? '' : 'border-t border-border-subtle'}
        >
          <CollectionRow book={book} />
        </div>
      ))}
    </div>
  )
}
