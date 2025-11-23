/**
 * @jest-environment node
 */

import { GET } from '../gregorian-month/route'
import { NextRequest } from 'next/server'

describe('/api/calendar/gregorian-month', () => {
  it('should return 400 if month is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/gregorian-month?year=2024')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required parameters')
  })

  it('should return 400 if year is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/gregorian-month?month=11')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required parameters')
  })

  it('should return 400 if month is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/gregorian-month?month=13&year=2024')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid month')
  })

  it('should return 400 if month is less than 1', async () => {
    const request = new NextRequest('http://localhost:3000/api/calendar/gregorian-month?month=0&year=2024')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid month')
  })
})

