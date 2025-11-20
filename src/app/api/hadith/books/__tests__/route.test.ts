import { GET } from '../route'

// Mock environment variable
process.env.HADITH_API_KEY = 'test-api-key'

// Mock fetch
global.fetch = jest.fn()

describe('/api/hadith/books', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return books list when API call succeeds', async () => {
    const mockBooks = [
      {
        id: 1,
        bookName: 'Sahih Bukhari',
        writerName: 'Imam Bukhari',
        writerDeath: '256 ھ',
        bookSlug: 'sahih-bukhari',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: 'Books has been found.',
        books: mockBooks,
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(data.status).toBe(200)
    expect(data.books).toHaveLength(1)
    expect(data.books[0].bookName).toBe('Sahih Bukhari')
  })

  it('should return 500 when HADITH_API_KEY is missing', async () => {
    const originalKey = process.env.HADITH_API_KEY
    delete process.env.HADITH_API_KEY

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Hadith API is not configured')

    process.env.HADITH_API_KEY = originalKey
  })

  it('should return 500 when API call fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch hadith collections')
  })
})

