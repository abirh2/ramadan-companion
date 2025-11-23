/**
 * @jest-environment node
 */

import { GET } from '../hijri-month/route'
import { NextRequest } from 'next/server'

describe('/api/calendar/hijri-month', () => {
  it('should return 400 if month is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/hijri-month?year=1446')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required parameters')
  })

  it('should return 400 if year is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/hijri-month?month=9')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required parameters')
  })

  it('should return 400 if month is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/hijri-month?month=13&year=1446')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid month')
  })

  it('should return 400 if month is less than 1', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/hijri-month?month=0&year=1446')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid month')
  })
})

