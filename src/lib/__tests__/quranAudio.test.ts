import {
  AVAILABLE_RECITERS,
  DEFAULT_RECITER,
  getAyahAudioUrl,
  getAyahAudioUrlLowQuality,
  getReciterById,
} from '../quranAudio'

describe('quranAudio utilities', () => {
  describe('AVAILABLE_RECITERS', () => {
    it('exports array of available reciters', () => {
      expect(AVAILABLE_RECITERS).toBeDefined()
      expect(Array.isArray(AVAILABLE_RECITERS)).toBe(true)
      expect(AVAILABLE_RECITERS.length).toBeGreaterThan(0)
    })

    it('includes required reciter properties', () => {
      AVAILABLE_RECITERS.forEach(reciter => {
        expect(reciter).toHaveProperty('identifier')
        expect(reciter).toHaveProperty('name')
        expect(reciter).toHaveProperty('englishName')
        expect(reciter).toHaveProperty('language')
      })
    })

    it('includes Alafasy as default reciter', () => {
      const alafasy = AVAILABLE_RECITERS.find(r => r.identifier === 'ar.alafasy')
      expect(alafasy).toBeDefined()
      expect(alafasy?.englishName).toBe('Alafasy')
    })

    it('includes all 6 expected reciters with verified CDN availability', () => {
      expect(AVAILABLE_RECITERS.length).toBe(6)
      
      const reciterIds = AVAILABLE_RECITERS.map(r => r.identifier)
      expect(reciterIds).toContain('ar.alafasy')
      expect(reciterIds).toContain('ar.husary')
      expect(reciterIds).toContain('ar.husarymujawwad')
      expect(reciterIds).toContain('ar.shaatree')
      expect(reciterIds).toContain('ar.mahermuaiqly')
      expect(reciterIds).toContain('ar.minshawi')
    })
  })

  describe('DEFAULT_RECITER', () => {
    it('is set to Alafasy', () => {
      expect(DEFAULT_RECITER).toBe('ar.alafasy')
    })
  })

  describe('getAyahAudioUrl', () => {
    it('constructs correct CDN URL with default reciter', () => {
      const url = getAyahAudioUrl(262)
      expect(url).toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3')
    })

    it('constructs correct CDN URL with specified reciter', () => {
      const url = getAyahAudioUrl(262, 'ar.husary')
      expect(url).toBe('https://cdn.islamic.network/quran/audio/128/ar.husary/262.mp3')
    })

    it('handles different ayah numbers', () => {
      const url1 = getAyahAudioUrl(1, 'ar.alafasy')
      const url2 = getAyahAudioUrl(6236, 'ar.alafasy')
      
      expect(url1).toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3')
      expect(url2).toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3')
    })

    it('uses 128kbps quality', () => {
      const url = getAyahAudioUrl(262)
      expect(url).toContain('/128/')
    })

    it('returns MP3 format', () => {
      const url = getAyahAudioUrl(262)
      expect(url).toMatch(/\.mp3$/)
    })
  })

  describe('getAyahAudioUrlLowQuality', () => {
    it('constructs correct CDN URL with 64kbps quality', () => {
      const url = getAyahAudioUrlLowQuality(262)
      expect(url).toBe('https://cdn.islamic.network/quran/audio/64/ar.alafasy/262.mp3')
    })

    it('constructs correct URL with specified reciter', () => {
      const url = getAyahAudioUrlLowQuality(262, 'ar.husary')
      expect(url).toBe('https://cdn.islamic.network/quran/audio/64/ar.husary/262.mp3')
    })

    it('uses 64kbps quality', () => {
      const url = getAyahAudioUrlLowQuality(262)
      expect(url).toContain('/64/')
    })

    it('handles different ayah numbers', () => {
      const url = getAyahAudioUrlLowQuality(1)
      expect(url).toBe('https://cdn.islamic.network/quran/audio/64/ar.alafasy/1.mp3')
    })
  })

  describe('getReciterById', () => {
    it('returns reciter object for valid ID', () => {
      const reciter = getReciterById('ar.alafasy')
      expect(reciter).toBeDefined()
      expect(reciter?.identifier).toBe('ar.alafasy')
      expect(reciter?.englishName).toBe('Alafasy')
    })

    it('returns correct reciter for different IDs', () => {
      const husary = getReciterById('ar.husary')
      expect(husary?.englishName).toBe('Husary')
      
      const minshawi = getReciterById('ar.minshawi')
      expect(minshawi?.englishName).toBe('Minshawi')
    })

    it('returns undefined for invalid ID', () => {
      const reciter = getReciterById('invalid.reciter' as any)
      expect(reciter).toBeUndefined()
    })

    it('returns object with all required properties', () => {
      const reciter = getReciterById('ar.mahermuaiqly')
      expect(reciter).toHaveProperty('identifier')
      expect(reciter).toHaveProperty('name')
      expect(reciter).toHaveProperty('englishName')
      expect(reciter).toHaveProperty('language')
    })
  })

  describe('CDN URL structure', () => {
    it('uses islamic.network CDN domain', () => {
      const url = getAyahAudioUrl(262)
      expect(url).toContain('cdn.islamic.network')
    })

    it('follows AlQuran Cloud CDN pattern', () => {
      const url = getAyahAudioUrl(262, 'ar.alafasy')
      expect(url).toMatch(/https:\/\/cdn\.islamic\.network\/quran\/audio\/\d+\/[\w.]+\/\d+\.mp3/)
    })

    it('constructs valid URLs for all reciters', () => {
      AVAILABLE_RECITERS.forEach(reciter => {
        const url = getAyahAudioUrl(262, reciter.identifier as any)
        expect(url).toMatch(/^https:\/\//)
        expect(url).toContain(reciter.identifier)
        expect(url).toMatch(/\.mp3$/)
      })
    })
  })
})

