import {
  createPrayerOccurrences,
  createPrayerWidgetSnapshot,
} from '@/lib/widgetSnapshot'

describe('createPrayerWidgetSnapshot', () => {
  it('turns the app schedule into timestamped prayer occurrences without coordinates', () => {
    const occurrences = createPrayerOccurrences({
      '2026-09-09': {
        fajr: '05:30',
        dhuhr: '12:54',
        asr: '16:36',
        maghrib: '19:12',
        isha: '20:28',
      },
    })

    expect(occurrences).toHaveLength(5)
    expect(occurrences[2]).toEqual({
      name: 'Asr',
      time: '4:36 PM',
      timestamp: new Date(2026, 8, 9, 16, 36, 0, 0).toISOString(),
      dayKey: '2026-09-09',
    })
  })

  it('normalizes and sorts upcoming prayers around one stable next-prayer value', () => {
    const snapshot = createPrayerWidgetSnapshot({
      generatedAt: '2026-09-09T16:00:00.000Z',
      timezone: 'America/New_York',
      locationLabel: '  New York, USA  ',
      gregorianDate: 'September 9, 2026',
      hijriDate: '27 Rabi al-Awwal 1448',
      prayers: [
        { name: 'Maghrib', time: '7:12 PM', timestamp: '2026-09-09T23:12:00.000Z', dayKey: '2026-09-09' },
        { name: 'Asr', time: '4:36 PM', timestamp: '2026-09-09T20:36:00.000Z', dayKey: '2026-09-09' },
        { name: 'Dhuhr', time: '12:54 PM', timestamp: '2026-09-09T16:54:00.000Z', dayKey: '2026-09-09' },
      ],
    })

    expect(snapshot?.version).toBe(1)
    expect(snapshot?.locationLabel).toBe('New York, USA')
    expect(snapshot?.prayers.map((prayer) => prayer.name)).toEqual([
      'Dhuhr',
      'Asr',
      'Maghrib',
    ])
    expect(snapshot?.nextPrayer).toEqual(snapshot?.prayers[0])
    expect(snapshot?.deepLink).toBe('/times')
    expect(snapshot?.expiresAt).toBe('2026-09-10T05:12:00.000Z')
  })

  it('keeps earlier prayers from the current local day for full-day widgets', () => {
    const generatedAt = new Date(2026, 8, 9, 15, 0, 0, 0).toISOString()
    const fajr = new Date(2026, 8, 9, 5, 30, 0, 0).toISOString()
    const dhuhr = new Date(2026, 8, 9, 12, 54, 0, 0).toISOString()
    const asr = new Date(2026, 8, 9, 16, 36, 0, 0).toISOString()

    const snapshot = createPrayerWidgetSnapshot({
      generatedAt,
      timezone: 'America/New_York',
      locationLabel: 'New York, USA',
      gregorianDate: 'September 9, 2026',
      hijriDate: '27 Rabi al-Awwal 1448',
      prayers: [
        { name: 'Fajr', time: '5:30 AM', timestamp: fajr, dayKey: '2026-09-09' },
        { name: 'Dhuhr', time: '12:54 PM', timestamp: dhuhr, dayKey: '2026-09-09' },
        { name: 'Asr', time: '4:36 PM', timestamp: asr, dayKey: '2026-09-09' },
      ],
    })

    expect(snapshot?.prayers.map((prayer) => prayer.name)).toEqual(['Fajr', 'Dhuhr', 'Asr'])
    expect(snapshot?.nextPrayer.name).toBe('Asr')
    expect(snapshot?.nextPrayer).toEqual(snapshot?.prayers[2])
  })

  it('drops prior-day, malformed, and unsupported prayer entries', () => {
    const generatedAt = new Date(2026, 8, 9, 12, 0, 0, 0).toISOString()
    const yesterdayFajr = new Date(2026, 8, 8, 5, 30, 0, 0).toISOString()
    const maghrib = new Date(2026, 8, 9, 19, 12, 0, 0).toISOString()

    const snapshot = createPrayerWidgetSnapshot({
      generatedAt,
      timezone: 'UTC',
      locationLabel: '',
      gregorianDate: 'September 9, 2026',
      hijriDate: '',
      prayers: [
        { name: 'Fajr', time: '5:30 AM', timestamp: yesterdayFajr, dayKey: '2026-09-08' },
        { name: 'Asr', time: '4:36 PM', timestamp: 'not-a-date', dayKey: '2026-09-09' },
        // Runtime input can still arrive from loosely typed API data.
        { name: 'Sunrise', time: '6:42 AM', timestamp: '2026-09-10T06:42:00.000Z', dayKey: '2026-09-10' },
        { name: 'Maghrib', time: '7:12 PM', timestamp: maghrib, dayKey: '2026-09-09' },
      ] as never,
    })

    expect(snapshot?.prayers).toEqual([
      { name: 'Maghrib', time: '7:12 PM', timestamp: maghrib, dayKey: '2026-09-09' },
    ])
    expect(snapshot?.nextPrayer.name).toBe('Maghrib')
  })

  it('returns null when no trustworthy future prayer is available', () => {
    const generatedAt = new Date(2026, 8, 9, 12, 0, 0, 0).toISOString()
    const fajr = new Date(2026, 8, 9, 5, 30, 0, 0).toISOString()

    const snapshot = createPrayerWidgetSnapshot({
      generatedAt,
      timezone: 'UTC',
      locationLabel: 'Mecca',
      gregorianDate: 'September 9, 2026',
      hijriDate: '27 Rabi al-Awwal 1448',
      prayers: [
        { name: 'Fajr', time: '5:30 AM', timestamp: fajr, dayKey: '2026-09-09' },
      ],
    })

    expect(snapshot).toBeNull()
  })

  it('never serializes precise coordinates or account data', () => {
    const snapshot = createPrayerWidgetSnapshot({
      generatedAt: '2026-09-09T16:00:00.000Z',
      timezone: 'America/New_York',
      locationLabel: 'New York, USA',
      gregorianDate: 'September 9, 2026',
      hijriDate: '27 Rabi al-Awwal 1448',
      prayers: [
        { name: 'Asr', time: '4:36 PM', timestamp: '2026-09-09T20:36:00.000Z', dayKey: '2026-09-09' },
      ],
    })

    const serialized = JSON.stringify(snapshot)
    expect(serialized).not.toMatch(/latitude|longitude|\blat\b|\blng\b|account|userId/)
  })
})
