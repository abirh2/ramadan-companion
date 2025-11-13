import { AuthButton } from '@/components/auth/AuthButton'
import { NextPrayerCard } from '@/components/dashboard/NextPrayerCard'
import { RamadanCard } from '@/components/dashboard/RamadanCard'
import { QuranCard } from '@/components/dashboard/QuranCard'
import { HadithCard } from '@/components/dashboard/HadithCard'
import { CharityCard } from '@/components/dashboard/CharityCard'
import { ZikrCard } from '@/components/dashboard/ZikrCard'
import { PlacesCard } from '@/components/dashboard/PlacesCard'
import { AdminCard } from '@/components/dashboard/AdminCard'
import { FeedbackButton } from '@/components/FeedbackButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Ramadan Companion</h1>
          <AuthButton />
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Hero Section - Ramadan Countdown */}
        <div className="mb-6 md:mb-8">
          <div className="md:max-w-3xl md:mx-auto">
            <RamadanCard />
          </div>
        </div>

        {/* Grid Section - Other Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <NextPrayerCard />
          <QuranCard />
          <HadithCard />
          <CharityCard />
          <ZikrCard />
          <PlacesCard />
          <AdminCard />
        </div>

        {/* Feedback Button */}
        <FeedbackButton pagePath="/" />
      </main>
    </div>
  )
}
