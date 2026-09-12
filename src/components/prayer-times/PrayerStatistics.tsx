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
  completed: 'var(--success)',
  incomplete: 'var(--text-tertiary)',
  Fajr: 'var(--chart-4)',
  Dhuhr: 'var(--success)',
  Asr: 'var(--gold)',
  Maghrib: 'var(--destructive)',
  Isha: 'var(--teal)',
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
      <Card variant="grouped" className="gap-0 py-0">
        <CardHeader className="px-5 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="type-body flex items-center gap-2 font-semibold">
              <TrendingUp className="size-5 text-teal" aria-hidden="true" />
              Prayer Statistics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-4 py-3 text-center">
            <Calendar className="mx-auto size-8 text-text-tertiary" strokeWidth={1.6} aria-hidden="true" />
            <div className="space-y-2">
              <p className="type-body-secondary text-text-secondary">
                Sign in to track prayer history and view your progress.
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link href="/profile">
                  Sign In to Track Progress
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="grouped" className="gap-0 py-0">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="type-body flex items-center gap-2 font-semibold">
            <TrendingUp className="size-5 text-teal" aria-hidden="true" />
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
                <ChevronUp className="size-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <span className="text-sm">Show</span>
                <ChevronDown className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 border-t border-border-subtle px-5 py-5">
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
            <div className="space-y-3 rounded-grouped border border-border-subtle bg-teal-muted p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-teal" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">
                      Building your history...
                    </p>
                    <span className="text-sm font-semibold text-teal">
                      {accountAgeDays}/{timeRangeDays} days
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-elevated">
                    <div
                      className="h-2 rounded-full bg-teal transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary">
                    Keep marking your prayers to unlock full {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label.toLowerCase()} insights! ({progressPercentage}% complete)
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10" role="status" aria-live="polite">
              <Loader2 className="size-5 animate-spin text-teal motion-reduce:animate-none" aria-hidden="true" />
              <span className="type-body-secondary text-text-secondary">Loading prayer history…</span>
            </div>
          ) : !statistics || statistics.totalDays === 0 ? (
            <div className="space-y-3 py-8 text-center" role="status">
              <Calendar className="mx-auto size-8 text-text-tertiary" strokeWidth={1.6} aria-hidden="true" />
              <p className="type-body-secondary text-text-secondary">
                Your prayer history will appear after you begin marking prayers.
              </p>
            </div>
          ) : (
            <>
              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="type-caption text-text-secondary">Completion Rate</p>
                  <p className="text-2xl font-semibold tabular-nums text-text-primary">
                    {statistics.overallCompletionRate.toFixed(0)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="type-caption text-text-secondary">Total Prayers</p>
                  <p className="text-2xl font-semibold tabular-nums text-text-primary">
                    {statistics.completedPrayers}/{statistics.totalPrayers}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="type-caption text-text-secondary">Days Tracked</p>
                  <p className="text-2xl font-semibold tabular-nums text-text-primary">{statistics.totalDays}</p>
                </div>
                <div className="space-y-1">
                  <p className="type-caption text-text-secondary">Perfect Days</p>
                  <p className="text-2xl font-semibold tabular-nums text-text-primary">
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
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--muted-foreground)' }}
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-control)',
                      }}
                      formatter={(value: number | undefined) => [`${value?.toFixed(0) ?? 0}/5`, 'Prayers Completed']}
                      labelFormatter={(label) => {
                        const date = new Date(label)
                        return date.toLocaleDateString()
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalCompleted"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      name="Prayers Completed"
                      dot={{ fill: 'var(--primary)', r: 3 }}
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
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-control)',
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
                  <div className="rounded-grouped border border-border-subtle bg-teal-muted p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="size-5 text-teal" aria-hidden="true" />
                      <p className="font-medium">Most Consistent Prayer</p>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">
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
