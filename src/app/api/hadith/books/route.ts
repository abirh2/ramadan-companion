import { NextResponse } from 'next/server'

const HADITH_API_BASE_URL = 'https://hadithapi.com/api'
const HADITH_API_KEY = process.env.HADITH_API_KEY

// Raw API response structure from HadithAPI
interface RawHadithBook {
  id: number
  bookName: string
  writerName: string
  aboutWriter: string | null
  writerDeath: string
  bookSlug: string
  hadiths_count: string | number
  chapters_count: string | number
}

interface RawHadithBooksResponse {
  status: number
  message: string
  books: RawHadithBook[]
}

/**
 * GET /api/hadith/books
 * 
 * Fetches all available hadith collections from HadithAPI
 * Filters out collections with no hadith content
 * Returns list of books with metadata (name, author, slug)
 */
export async function GET() {
  try {
    // Validate API key
    if (!HADITH_API_KEY) {
      console.error('HADITH_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Hadith API is not configured' },
        { status: 500 }
      )
    }

    // Fetch books from HadithAPI
    const apiUrl = `${HADITH_API_BASE_URL}/books?apiKey=${HADITH_API_KEY}`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours (books list is static)
    })

    if (!response.ok) {
      throw new Error(`HadithAPI responded with status ${response.status}`)
    }

    const data: RawHadithBooksResponse = await response.json()

    // Validate response structure
    if (data.status !== 200 || !data.books) {
      throw new Error('Invalid response from HadithAPI')
    }

    // Filter out books with no hadith content (hadiths_count === "0")
    // Currently: musnad-ahmad and al-silsila-sahiha have empty databases
    const booksWithContent = data.books
      .filter(book => {
        const hadithCount = typeof book.hadiths_count === 'string' 
          ? parseInt(book.hadiths_count, 10) 
          : book.hadiths_count
        return hadithCount > 0
      })
      .map(book => ({
        id: book.id,
        bookName: book.bookName,
        writerName: book.writerName,
        writerDeath: book.writerDeath,
        bookSlug: book.bookSlug,
      }))

    return NextResponse.json({
      status: data.status,
      message: data.message,
      books: booksWithContent
    })
  } catch (error) {
    console.error('Error in /api/hadith/books:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch hadith collections',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

