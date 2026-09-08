import { DailyReflection } from '@/components/dashboard/DailyReflection'
import { HomeDateContext } from '@/components/dashboard/HomeDateContext'
import { IslamicEventsCarousel } from '@/components/dashboard/IslamicEventsCarousel'
import { NextPrayerCard } from '@/components/dashboard/NextPrayerCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { FeedbackButton } from '@/components/FeedbackButton'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      <div className="space-y-8">
        <div className="space-y-5">
          <HomeDateContext />
          <NextPrayerCard />
        </div>
        <IslamicEventsCarousel />
        <DailyReflection />
        <QuickActions />
      </div>
      <FeedbackButton pagePath="/" />
    </div>
  )
}
