import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock environment variable
process.env.HADITH_API_KEY = 'test-api-key'

// Mock fetch globally
global.fetch = jest.fn()

describe('/api/hadith', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Cross-reference detection', () => {
    it('should skip cross-reference hadiths and fetch adjacent complete hadith', async () => {
      const mockCrossRefResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: 'A hadith like this has been narrated by Abu Huraira through another chain of transmitters.',
              hadithUrdu: 'اردو متن',
              hadithArabic: 'حَدَّثَنَا يَحْيَى بْنُ يَحْيَى',
              englishNarrator: 'Abu Huraira',
              hadithNumber: '2275',
              status: 'Sahih',
              book: { bookName: 'Sahih Muslim', bookSlug: 'sahih-muslim', writerName: 'Imam Muslim' },
              chapter: { chapterEnglish: 'The Book of Zakat', chapterArabic: 'كتاب الزكاة' },
              volume: '7',
            },
          ],
        },
      }

      const mockCompleteResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: 'The Messenger of Allah (ﷺ) said: "Give charity from what you have earned..."',
              hadithUrdu: 'رسول اللہ صلی اللہ علیہ وسلم نے فرمایا',
              hadithArabic: 'قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
              englishNarrator: 'Abu Huraira',
              hadithNumber: '2276',
              status: 'Sahih',
              book: { bookName: 'Sahih Muslim', bookSlug: 'sahih-muslim', writerName: 'Imam Muslim' },
              chapter: { chapterEnglish: 'The Book of Zakat', chapterArabic: 'كتاب الزكاة' },
              volume: '7',
            },
          ],
        },
      }

      // First call returns cross-reference, second call returns complete hadith
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossRefResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompleteResponse,
        })

      const request = new NextRequest('http://localhost:3000/api/hadith?language=english')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hadithEnglish).toContain('Give charity from what you have earned')
      expect(data.hadithNumber).toBe('2276')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should detect various cross-reference patterns', async () => {
      const patterns = [
        'A similar hadith has been narrated',
        'This hadith like this has been narrated by',
        'This has been transmitted through another chain',
        'Narrated through another chain of transmitters',
        'Has been transmitted on the authority of',
        'A hadith like this was reported',
      ]

      for (const pattern of patterns) {
        const mockResponse = {
          status: 200,
          hadiths: {
            data: [
              {
                hadithEnglish: pattern,
                hadithUrdu: 'اردو',
                hadithArabic: 'عربي',
                englishNarrator: 'Test',
                hadithNumber: '1',
                status: 'Sahih',
                book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
                chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
                volume: '1',
              },
            ],
          },
        }

        const completeResponse = {
          status: 200,
          hadiths: {
            data: [
              {
                hadithEnglish: 'Complete hadith text here',
                hadithUrdu: 'مکمل حدیث',
                hadithArabic: 'نص الحديث الكامل',
                englishNarrator: 'Test',
                hadithNumber: '2',
                status: 'Sahih',
                book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
                chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
                volume: '1',
              },
            ],
          },
        }

        ;(global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => completeResponse,
          })

        const request = new NextRequest('http://localhost:3000/api/hadith')
        const response = await GET(request)
        const data = await response.json()

        expect(data.hadithEnglish).toBe('Complete hadith text here')
        jest.clearAllMocks()
      }
    })

    it('should return complete hadiths without modification', async () => {
      const mockCompleteResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: 'The Messenger of Allah (ﷺ) said: "Actions are judged by intentions..."',
              hadithUrdu: 'رسول اللہ صلی اللہ علیہ وسلم نے فرمایا',
              hadithArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
              englishNarrator: "Umar bin Al-Khattab",
              hadithNumber: '1',
              status: 'Sahih',
              book: { bookName: 'Sahih Bukhari', bookSlug: 'sahih-bukhari', writerName: 'Imam Bukhari' },
              chapter: { chapterEnglish: 'Revelation', chapterArabic: 'بدء الوحي' },
              volume: '1',
            },
          ],
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompleteResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hadithEnglish).toContain('Actions are judged by intentions')
      expect(data.hadithNumber).toBe('1')
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only one call needed
    })

    it('should handle MAX_ATTEMPTS exhaustion gracefully', async () => {
      // Mock all attempts returning cross-references
      const mockCrossRefResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: 'A similar hadith has been narrated',
              hadithUrdu: 'اردو',
              hadithArabic: 'عربي',
              englishNarrator: 'Test',
              hadithNumber: '1',
              status: 'Sahih',
              book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
              chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
              volume: '1',
            },
          ],
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCrossRefResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch hadith')
      expect(data.details).toContain('Could not find complete hadith')
      expect(global.fetch).toHaveBeenCalledTimes(10) // MAX_ATTEMPTS
    })

    it('should handle empty hadithEnglish as cross-reference', async () => {
      const mockEmptyResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: '',
              hadithUrdu: 'اردو',
              hadithArabic: 'عربي',
              englishNarrator: 'Test',
              hadithNumber: '100',
              status: 'Sahih',
              book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
              chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
              volume: '1',
            },
          ],
        },
      }

      const mockCompleteResponse = {
        status: 200,
        hadiths: {
          data: [
            {
              hadithEnglish: 'Complete hadith text',
              hadithUrdu: 'مکمل حدیث',
              hadithArabic: 'نص الحديث',
              englishNarrator: 'Test',
              hadithNumber: '101',
              status: 'Sahih',
              book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
              chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
              volume: '1',
            },
          ],
        },
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEmptyResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompleteResponse,
        })

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hadithEnglish).toBe('Complete hadith text')
      expect(data.hadithNumber).toBe('101')
    })
  })

  describe('Deterministic behavior', () => {
    it('should follow predictable offset sequence: 0, +1, -1, +2, -2, ...', async () => {
      const callOrder: number[] = []

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        const match = url.match(/hadithNumber=(\d+)/)
        if (match) {
          callOrder.push(parseInt(match[1]))
        }

        // Return cross-reference for all but last attempt
        if (callOrder.length < 5) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 200,
              hadiths: {
                data: [
                  {
                    hadithEnglish: 'Similar hadith narrated',
                    hadithUrdu: 'اردو',
                    hadithArabic: 'عربي',
                    englishNarrator: 'Test',
                    hadithNumber: callOrder[callOrder.length - 1].toString(),
                    status: 'Sahih',
                    book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
                    chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
                    volume: '1',
                  },
                ],
              },
            }),
          })
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 200,
            hadiths: {
              data: [
                {
                  hadithEnglish: 'Complete hadith',
                  hadithUrdu: 'مکمل',
                  hadithArabic: 'كامل',
                  englishNarrator: 'Test',
                  hadithNumber: callOrder[callOrder.length - 1].toString(),
                  status: 'Sahih',
                  book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
                  chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
                  volume: '1',
                },
              ],
            },
          }),
        })
      })

      const request = new NextRequest('http://localhost:3000/api/hadith')
      await GET(request)

      // Verify offset pattern (assuming base hadith number around 2000-3000)
      expect(callOrder.length).toBe(5)
      // Check offsets: should be [base, base+1, base-1, base+2, base-2]
      const base = callOrder[0]
      expect(callOrder[1]).toBe(base + 1)
      expect(callOrder[2]).toBe(base - 1)
      expect(callOrder[3]).toBe(base + 2)
      expect(callOrder[4]).toBe(base - 2)
    })
  })

  describe('Error handling', () => {
    it('should handle missing API key', async () => {
      const originalKey = process.env.HADITH_API_KEY
      delete process.env.HADITH_API_KEY

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Hadith API is not configured')

      process.env.HADITH_API_KEY = originalKey
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch hadith')
    })

    it('should skip invalid hadith numbers (< 1)', async () => {
      const callOrder: number[] = []

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        const match = url.match(/hadithNumber=(\d+)/)
        if (match) {
          const num = parseInt(match[1])
          callOrder.push(num)

          if (num < 1) {
            return Promise.reject(new Error('Invalid hadith number'))
          }
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 200,
            hadiths: {
              data: [
                {
                  hadithEnglish: 'Complete hadith text',
                  hadithUrdu: 'مکمل',
                  hadithArabic: 'كامل',
                  englishNarrator: 'Test',
                  hadithNumber: '1',
                  status: 'Sahih',
                  book: { bookName: 'Test', bookSlug: 'test', writerName: 'Test' },
                  chapter: { chapterEnglish: 'Test', chapterArabic: 'Test' },
                  volume: '1',
                },
              ],
            },
          }),
        })
      })

      const request = new NextRequest('http://localhost:3000/api/hadith')
      const response = await GET(request)

      expect(response.status).toBe(200)
      // Should not include any negative numbers in call order
      expect(callOrder.every((num) => num >= 1)).toBe(true)
    })
  })
})

