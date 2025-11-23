/**
 * @jest-environment node
 */

import { GET } from '../convert/route'
import { NextRequest } from 'next/server'

describe('/api/calendar/convert', () => {
  it('should return 400 if date is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/convert')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required parameter')
  })

  it('should return 400 if date format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/convert?date=2024-11-21')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid date format')
  })

  it('should return 400 if direction is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/convert?date=21-11-2024&direction=invalid')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid direction')
  })

  it('should accept valid date in DD-MM-YYYY format', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/convert?date=21-11-2024')
    const response = await GET(request)
    
    // Should not return 400
    expect(response.status).not.toBe(400)
  })
})

