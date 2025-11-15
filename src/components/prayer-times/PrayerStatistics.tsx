'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, TrendingUp, Calendar, Award, Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { PrayerStatistics, TimeRange } from '@/types/prayer-tracking.types'
import Link from 'next/link'

interface PrayerStatisticsProps {
  statistics: PrayerStatistics | null
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  loading: boolean
  isAuthenticated: boolean
  accountCreatedAt: string | null
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: '90days', label: '90 Days' },
  { value: 'all', label: 'All Time' },
]

const COLORS = {
  completed: 'hsl(142 76% 36%)', // Green for completed
  incomplete: 'hsl(240 5% 65%)', // Gray for incomplete
  Fajr: 'hsl(217 91% 60%)', // Blue
  Dhuhr: 'hsl(142 76% 36%)', // Green
  Asr: 'hsl(38 92% 50%)', // Orange
  Maghrib: 'hsl(0 84% 60%)', // Red
  Isha: 'hsl(271 91% 65%)', // Purple
}

// Helper function to calculate account age in days
function getAccountAgeDays(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = now.getTime() - created.getTime()
  // Use Math.round for more accurate day count
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Helper function to get days from time range
function getTimeRangeDays(range: TimeRange, accountCreatedAt: string | null): number {
  switch (range) {
    case '7days':
      return 7
    case '30days':
      return 30
    case '90days':
      return 90
    case 'all':
      // For "all time", use actual account age
      return accountCreatedAt ? getAccountAgeDays(accountCreatedAt) : Infinity
    default:
      return 30
  }
}

export function PrayerStatistics({
  statistics,
  timeRange,
  onTimeRangeChange,
  loading,
  isAuthenticated,
  accountCreatedAt,
}: PrayerStatisticsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate if account is too new for selected time range
  const accountAgeDays = accountCreatedAt ? getAccountAgeDays(accountCreatedAt) : null
  const timeRangeDays = getTimeRangeDays(timeRange, accountCreatedAt)
  // Never show progress indicator for "all time" since it means "since account creation"
  const showProgressIndicator = timeRange !== 'all' && accountAgeDays !== null && accountAgeDays < timeRangeDays
  const progressPercentage = accountAgeDays && timeRangeDays !== Infinity 
    ? Math.round((accountAgeDays / timeRangeDays) * 100)
    : 0

  // Guest user prompt
  if (!isAuthenticated) {
    return (
      <Card className="rounded-2xl shadow-sm border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Prayer Statistics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Sign in to track your prayer history and view detailed statistics
              </p>
              <Link href="/profile">
                <Button size="sm" className="mt-2">
                  Sign In to Track Progress
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Prayer Statistics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span className="text-sm">Hide</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="text-sm">Show</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {TIME_RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Account Age Progress Indicator */}
          {showProgressIndicator && accountAgeDays !== null && accountAgeDays > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Building your history...
                    </p>
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {accountAgeDays}/{timeRangeDays} days
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Keep marking your prayers to unlock full {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label.toLowerCase()} insights! ({progressPercentage}% complete)
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !statistics || statistics.totalDaysTracked === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No prayer tracking data yet. Start tracking your prayers to see statistics!
              </p>
            </div>
          ) : (
            <>
              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.overallCompletionRate.toFixed(0)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Prayers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.completedPrayers}/{statistics.totalPrayers}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Days Tracked</p>
                  <p className="text-2xl font-bold text-foreground">{statistics.totalDays}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Perfect Days</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.dailyCompletions.filter((d) => d.totalCompleted === 5).length}
                  </p>
                </div>
              </div>

              {/* Line Chart - Daily Completion Trend */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Daily Completion Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={statistics.dailyCompletions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}/5`, 'Prayers Completed']}
                      labelFormatter={(label) => {
                        const date = new Date(label)
                        return date.toLocaleDateString()
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalCompleted"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Prayers Completed"
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Overall Completion */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Overall Completion</h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Completed',
                            value: statistics.completedPrayers,
                          },
                          {
                            name: 'Incomplete',
                            value: statistics.totalPrayers - statistics.completedPrayers,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill={COLORS.completed} />
                        <Cell fill={COLORS.incomplete} />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Per-Prayer Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Prayer-by-Prayer Breakdown
                </h3>
                <div className="space-y-2">
                  {(Object.keys(statistics.byPrayer) as Array<keyof typeof statistics.byPrayer>).map(
                    (prayerName) => {
                      const prayer = statistics.byPrayer[prayerName]
                      return (
                        <div key={prayerName} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{prayerName}</span>
                            <span className="text-muted-foreground">
                              {prayer.completed}/{prayer.total} ({prayer.rate.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${prayer.rate}%` }}
                            />
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Best Prayer */}
              {(() => {
                const prayers = Object.entries(statistics.byPrayer)
                const bestPrayer = prayers.reduce((best, current) =>
                  current[1].rate > best[1].rate ? current : best
                )
                return (
                  <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-5 w-5 text-accent" />
                      <p className="font-medium">Most Consistent Prayer</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {bestPrayer[0]}{' '}
                      <span className="text-lg text-muted-foreground">
                        ({bestPrayer[1].rate.toFixed(0)}% completion)
                      </span>
                    </p>
                  </div>
                )
              })()}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

