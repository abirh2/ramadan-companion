'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Heart, BookOpen, Loader2 } from 'lucide-react'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'
import { useFavoritesList } from '@/hooks/useFavoritesList'
import { FavoriteQuranItem } from '@/components/favorites/FavoriteQuranItem'
import { FavoriteHadithItem } from '@/components/favorites/FavoriteHadithItem'
import { FeedbackButton } from '@/components/FeedbackButton'

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
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <Link
          href="/more"
          className="type-nav mb-3 inline-flex min-h-touch items-center gap-2 rounded-control text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to More"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <h1 className="type-page-title text-text-primary">Favorites</h1>
        <p className="type-body-secondary mt-2 text-text-secondary">Your saved Quran verses and hadith</p>
      </header>

      <ProtectedFeature
        title="Sign in to view favorites"
        description="Sign in to save and view your favorite Quran verses and hadiths."
      >
        <Tabs defaultValue="quran" className="w-full">
          <TabsList className="mx-auto mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quran">
              <BookOpen className="size-4" aria-hidden="true" />
              Quran
              {!quranLoading && quranFavorites.length > 0 && (
                <span className="rounded-round bg-teal-muted px-2 py-0.5 text-xs text-teal">
                  {quranFavorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="hadith">
              Hadith
              {!hadithLoading && hadithFavorites.length > 0 && (
                <span className="rounded-round bg-teal-muted px-2 py-0.5 text-xs text-teal">
                  {hadithFavorites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Quran Tab */}
          <TabsContent value="quran" className="space-y-4">
            {quranLoading && (
              <div className="flex items-center justify-center gap-3 py-12" role="status" aria-live="polite">
                <Loader2 className="size-5 animate-spin text-teal motion-reduce:animate-none" aria-hidden="true" />
                <span className="type-body-secondary text-text-secondary">Loading saved verses…</span>
              </div>
            )}

            {quranError && (
              <div className="rounded-grouped border border-border-subtle bg-surface-grouped p-5" role="alert">
                <p className="font-semibold text-text-primary">Saved verses could not be loaded.</p>
                <p className="type-body-secondary mt-1 text-text-secondary">{quranError}</p>
                <Button onClick={refetchQuran} variant="outline" size="sm" className="mt-4">
                  Try again
                </Button>
              </div>
            )}

            {!quranLoading && !quranError && quranEmpty && (
              <div className="rounded-grouped border border-border-subtle bg-surface-grouped px-5 py-8 text-center">
                <Heart className="mx-auto size-8 text-text-tertiary" strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <h3 className="mt-3 font-semibold text-text-primary">No saved Quran verses yet</h3>
                  <p className="type-body-secondary mx-auto mt-1 max-w-md text-text-secondary">
                    Use the heart action on any ayah to keep it here.
                  </p>
                  <Button asChild className="mt-5">
                    <Link href="/quran-hadith">
                      <BookOpen className="size-4" aria-hidden="true" />
                      View Daily Ayah
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!quranLoading && !quranError && !quranEmpty && (
              <div className="space-y-4">
                <p className="type-caption text-text-secondary">
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
              <div className="flex items-center justify-center gap-3 py-12" role="status" aria-live="polite">
                <Loader2 className="size-5 animate-spin text-teal motion-reduce:animate-none" aria-hidden="true" />
                <span className="type-body-secondary text-text-secondary">Loading saved hadith…</span>
              </div>
            )}

            {hadithError && (
              <div className="rounded-grouped border border-border-subtle bg-surface-grouped p-5" role="alert">
                <p className="font-semibold text-text-primary">Saved hadith could not be loaded.</p>
                <p className="type-body-secondary mt-1 text-text-secondary">{hadithError}</p>
                <Button onClick={refetchHadith} variant="outline" size="sm" className="mt-4">
                  Try again
                </Button>
              </div>
            )}

            {!hadithLoading && !hadithError && hadithEmpty && (
              <div className="rounded-grouped border border-border-subtle bg-surface-grouped px-5 py-8 text-center">
                <Heart className="mx-auto size-8 text-text-tertiary" strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <h3 className="mt-3 font-semibold text-text-primary">No saved hadith yet</h3>
                  <p className="type-body-secondary mx-auto mt-1 max-w-md text-text-secondary">
                    Use the heart action on any hadith to keep it here.
                  </p>
                  <Button asChild className="mt-5">
                    <Link href="/quran-hadith">
                      View Daily Hadith
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!hadithLoading && !hadithError && !hadithEmpty && (
              <div className="space-y-4">
                <p className="type-caption text-text-secondary">
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

      {/* Feedback Button */}
      <FeedbackButton pagePath="/favorites" />
    </div>
  )
}
