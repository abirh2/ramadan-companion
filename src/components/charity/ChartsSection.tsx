'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/currency'
import type { DonationWithConversion } from '@/types/donation.types'
import type { CurrencyCode } from '@/types/currency.types'

interface ChartsSectionProps {
  donations: DonationWithConversion[]
  preferredCurrency: CurrencyCode
}

export function ChartsSection({ donations, preferredCurrency }: ChartsSectionProps) {
  if (donations.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Add donations to see charts and insights about your giving patterns
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const monthlyData = prepareMonthlyData(donations)
  const typeData = prepareTypeData(donations)

  return (
    <div className="space-y-6">
      {/* Currency Note */}
      <p className="text-xs text-muted-foreground text-center">
        All amounts shown in {preferredCurrency}
      </p>

      {/* Line Chart - Monthly Trends */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Donation Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatCurrency(value, preferredCurrency).replace(/\.\d+$/, '')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [formatCurrency(value ?? 0, preferredCurrency), 'Amount']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Monthly Total"
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Monthly Comparison */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => [`$${value?.toFixed(2) ?? 0}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" name="Monthly Total" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Donation Types */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Breakdown by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => `$${value?.toFixed(2) ?? 0}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to prepare monthly data
function prepareMonthlyData(donations: DonationWithConversion[]) {
  const monthlyMap = new Map<string, number>()

  donations.forEach((donation) => {
    const date = new Date(donation.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: '2-digit',
    }).format(date)

    const current = monthlyMap.get(monthKey) || 0
    monthlyMap.set(monthKey, current + Number(donation.convertedAmount))
  })

  // Convert to array and sort by date
  const monthlyArray = Array.from(monthlyMap.entries())
    .map(([key, amount]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      const monthLabel = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: '2-digit',
      }).format(date)
      return {
        month: monthLabel,
        amount: parseFloat(amount.toFixed(2)),
        sortKey: key,
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  return monthlyArray
}

// Helper function to prepare type data
function prepareTypeData(donations: DonationWithConversion[]) {
  const typeMap = new Map<string, number>([
    ['zakat', 0],
    ['sadaqah', 0],
    ['other', 0],
  ])

  donations.forEach((donation) => {
    const current = typeMap.get(donation.type) || 0
    typeMap.set(donation.type, current + Number(donation.convertedAmount))
  })

  const colors: Record<string, string> = {
    zakat: '#10b981', // green
    sadaqah: '#3b82f6', // blue
    other: '#6b7280', // gray
  }

  return Array.from(typeMap.entries())
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(2)),
      color: colors[name] || '#6b7280',
    }))
}

// Custom label renderer for pie chart
function renderCustomLabel(entry: { name?: string; percent?: number }) {
  if (!entry.name || entry.percent === undefined) return ''
  const percent = (entry.percent * 100).toFixed(0)
  return `${entry.name} ${percent}%`
}

