import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SurahSelector } from '@/components/quran/SurahSelector'
import { JuzList } from '@/components/quran/JuzList'

export default function QuranBrowserPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex min-h-touch items-center gap-2 rounded-control text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="type-nav">Back to Home</span>
        </Link>
        <h1 className="type-page-title text-text-primary">Quran</h1>
      </div>

      <Tabs defaultValue="surah" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6" aria-label="Quran browsing options">
          <TabsTrigger value="surah">Surahs</TabsTrigger>
          <TabsTrigger value="juz">Juz</TabsTrigger>
        </TabsList>

        <TabsContent value="surah" role="tabpanel">
          <div className="surface-grouped p-4">
            <SurahSelector />
          </div>
        </TabsContent>

        <TabsContent value="juz" role="tabpanel">
          <JuzList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
