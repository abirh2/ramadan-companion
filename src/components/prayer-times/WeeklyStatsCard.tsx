'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PrayerStatistics } from '@/types/prayer-tracking.types'

interface WeeklyStatsCardProps {
  statistics: PrayerStatistics | null
  loading: boolean
  isAuthenticated: boolean
}

export function WeeklyStatsCard({ statistics, loading, isAuthenticated }: WeeklyStatsCardProps) {
  // Don't show for guest users
  if (!isAuthenticated) {
    return null
  }

  // Don't show if loading or no data
  if (loading || !statistics) {
    return null
  }

  // Get last 7 days of data
  const last7Days = statistics.dailyCompletions.slice(-7)
  
  // If we don't have 7 days of data yet, pad with zeros at the beginning
  const paddedDays = Array(7).fill(null).map((_, index) => {
    const dataIndex = index - (7 - last7Days.length)
    return dataIndex >= 0 ? last7Days[dataIndex] : null
  })

  // Calculate this week's completion rate
  const thisWeekTotal = last7Days.reduce((sum, day) => sum + day.totalCompleted, 0)
  const thisWeekPossible = last7Days.length * 5
  const thisWeekRate = thisWeekPossible > 0 ? (thisWeekTotal / thisWeekPossible) * 100 : 0

  // Calculate previous week's rate for trend comparison
  const previousWeek = statistics.dailyCompletions.slice(-14, -7)
  const prevWeekTotal = previousWeek.reduce((sum, day) => sum + day.totalCompleted, 0)
  const prevWeekPossible = previousWeek.length * 5
  const prevWeekRate = prevWeekPossible > 0 ? (prevWeekTotal / prevWeekPossible) * 100 : 0
  
  const trendDiff = thisWeekRate - prevWeekRate
  const hasTrend = previousWeek.length > 0

  // Get day labels (M, T, W, T, F, S, S)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  // Get today's day of week (0 = Sunday, 6 = Saturday)
  const today = new Date().getDay()
  // Convert to Monday-first (0 = Monday, 6 = Sunday)
  const todayIndex = today === 0 ? 6 : today - 1

  return (
    <Card className="rounded-3xl shadow-md border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Weekly Stats
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-foreground">
                {thisWeekRate.toFixed(0)}%
              </p>
              {hasTrend && (
                <span className="flex items-center text-xs font-normal">
                  {trendDiff > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500 mr-0.5" />
                      <span className="text-green-500">+{trendDiff.toFixed(0)}%</span>
                    </>
                  ) : trendDiff < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500 mr-0.5" />
                      <span className="text-red-500">{trendDiff.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3 text-muted-foreground mr-0.5" />
                      <span className="text-muted-foreground">0%</span>
                    </>
                  )}
                  <span className="text-muted-foreground ml-1">from last week</span>
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-muted relative flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-primary"
                strokeDasharray={`${(thisWeekRate / 100) * 125.6} 125.6`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[10px] font-bold relative z-10">
              {thisWeekRate.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end justify-between h-16 gap-1 px-1">
          {paddedDays.map((day, index) => {
            const heightPercentage = day ? (day.totalCompleted / 5) * 100 : 0
            const isToday = index === todayIndex
            const hasData = day !== null

            return (
              <div
                key={index}
                className="w-full relative overflow-hidden rounded-t-lg bg-muted/30"
                style={{ height: '100%' }}
              >
                {hasData && (
                  <div
                    className={`absolute bottom-0 w-full transition-all duration-500 rounded-t-lg ${
                      isToday
                        ? 'bg-primary'
                        : 'bg-primary/20'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Day Labels */}
        <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground px-1 uppercase">
          {dayLabels.map((label, index) => (
            <span key={index} className={index === todayIndex ? 'text-primary font-bold' : ''}>
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
