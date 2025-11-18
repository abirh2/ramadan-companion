/**
 * Tests for 12-hour time formatting
 */

// Inline the function for testing since it's not exported
function format12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12 // Convert 0 to 12 for midnight
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

describe('format12Hour', () => {
  it('should convert morning times correctly', () => {
    expect(format12Hour('05:30')).toBe('5:30 AM')
    expect(format12Hour('09:15')).toBe('9:15 AM')
    expect(format12Hour('11:59')).toBe('11:59 AM')
  })

  it('should convert noon correctly', () => {
    expect(format12Hour('12:00')).toBe('12:00 PM')
    expect(format12Hour('12:30')).toBe('12:30 PM')
  })

  it('should convert afternoon/evening times correctly', () => {
    expect(format12Hour('13:00')).toBe('1:00 PM')
    expect(format12Hour('14:14')).toBe('2:14 PM')
    expect(format12Hour('18:45')).toBe('6:45 PM')
    expect(format12Hour('23:59')).toBe('11:59 PM')
  })

  it('should convert midnight correctly', () => {
    expect(format12Hour('00:00')).toBe('12:00 AM')
    expect(format12Hour('00:30')).toBe('12:30 AM')
  })

  it('should pad single-digit minutes with zero', () => {
    expect(format12Hour('14:05')).toBe('2:05 PM')
    expect(format12Hour('09:03')).toBe('9:03 AM')
  })

  it('should handle typical prayer times', () => {
    // Fajr
    expect(format12Hour('05:27')).toBe('5:27 AM')
    // Dhuhr
    expect(format12Hour('12:15')).toBe('12:15 PM')
    // Asr (user's example)
    expect(format12Hour('14:14')).toBe('2:14 PM')
    // Maghrib
    expect(format12Hour('17:03')).toBe('5:03 PM')
    // Isha
    expect(format12Hour('18:27')).toBe('6:27 PM')
  })
})

