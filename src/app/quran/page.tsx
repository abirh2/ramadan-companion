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
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Quran Browser</h1>
        <p className="text-muted-foreground">
          Read and explore the Holy Quran by Surah or Juz
        </p>
      </div>

      <Tabs defaultValue="surah" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="surah">By Surah</TabsTrigger>
          <TabsTrigger value="juz">By Juz</TabsTrigger>
        </TabsList>

        <TabsContent value="surah">
          <SurahSelector />
        </TabsContent>

        <TabsContent value="juz">
          <JuzList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

