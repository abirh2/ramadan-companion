'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Heart, BookOpen, Loader2 } from 'lucide-react'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'
import { useFavoritesList } from '@/hooks/useFavoritesList'
import { FavoriteQuranItem } from '@/components/favorites/FavoriteQuranItem'
import { FavoriteHadithItem } from '@/components/favorites/FavoriteHadithItem'

export default function FavoritesPage() {
  const {
    favorites: quranFavorites,
    loading: quranLoading,
    error: quranError,
    refetch: refetchQuran,
    isEmpty: quranEmpty,
  } = useFavoritesList('quran')

  const {
    favorites: hadithFavorites,
    loading: hadithLoading,
    error: hadithError,
    refetch: refetchHadith,
    isEmpty: hadithEmpty,
  } = useFavoritesList('hadith')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Favorites</h1>
            </div>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        <ProtectedFeature
          title="Favorites"
          description="Sign in to save and view your favorite Quran verses and hadiths."
        >
          <Tabs defaultValue="quran" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="quran">
                <BookOpen className="h-4 w-4 mr-2" />
                Quran
                {!quranLoading && quranFavorites.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {quranFavorites.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="hadith">
                Hadith
                {!hadithLoading && hadithFavorites.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {hadithFavorites.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Quran Tab */}
            <TabsContent value="quran" className="space-y-4">
              {quranLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {quranError && (
                <Card className="rounded-xl">
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive mb-2">Failed to load favorites</p>
                    <p className="text-sm text-muted-foreground mb-4">{quranError}</p>
                    <Button onClick={refetchQuran} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!quranLoading && !quranError && quranEmpty && (
                <Card className="rounded-xl">
                  <CardContent className="p-12 text-center space-y-4">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No Quran Favorites Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building your collection by clicking the heart icon on any ayah.
                      </p>
                      <Link href="/quran-hadith">
                        <Button>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Daily Ayah
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!quranLoading && !quranError && !quranEmpty && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {quranFavorites.length} {quranFavorites.length === 1 ? 'verse' : 'verses'} saved
                  </p>
                  {quranFavorites.map((favorite) => (
                    <FavoriteQuranItem
                      key={favorite.id}
                      favorite={favorite}
                      onRemove={refetchQuran}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Hadith Tab */}
            <TabsContent value="hadith" className="space-y-4">
              {hadithLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {hadithError && (
                <Card className="rounded-xl">
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive mb-2">Failed to load favorites</p>
                    <p className="text-sm text-muted-foreground mb-4">{hadithError}</p>
                    <Button onClick={refetchHadith} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!hadithLoading && !hadithError && hadithEmpty && (
                <Card className="rounded-xl">
                  <CardContent className="p-12 text-center space-y-4">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No Hadith Favorites Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building your collection by clicking the heart icon on any hadith.
                      </p>
                      <Link href="/quran-hadith">
                        <Button>
                          View Daily Hadith
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!hadithLoading && !hadithError && !hadithEmpty && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {hadithFavorites.length} {hadithFavorites.length === 1 ? 'hadith' : 'hadiths'} saved
                  </p>
                  {hadithFavorites.map((favorite) => (
                    <FavoriteHadithItem
                      key={favorite.id}
                      favorite={favorite}
                      onRemove={refetchHadith}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ProtectedFeature>
      </main>
    </div>
  )
}

