import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Deen Companion',
  description: 'How Deen Companion collects, stores, and protects your data.',
}

const CONTACT_EMAIL = 'abirh@alumni.upenn.edu'

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href="/more">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to More
          </Link>
        </Button>
        <h1 className="type-page-title text-text-primary">Privacy Policy</h1>
        <p className="type-body-secondary mt-2 text-text-secondary">
          Last updated: September 15, 2026
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Deen Companion is built with privacy in mind:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No ads or third-party tracking scripts</li>
              <li>Most features work without an account</li>
              <li>Zakat calculator inputs are processed locally only and never stored</li>
              <li>Row-Level Security on all Supabase tables</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What We Store</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Location</th>
                    <th className="py-2 font-medium">Retention</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">Preferences (location, theme, prayer settings)</td>
                    <td className="py-2 pr-4">Device (localStorage) and/or Supabase if signed in</td>
                    <td className="py-2">Until cleared or account deleted</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Donation amounts and history; prayer completion; Quran and hadith favorites and bookmarks</td>
                    <td className="py-2 pr-4">Supabase (signed-in users only)</td>
                    <td className="py-2">Until account deleted</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Feedback</td>
                    <td className="py-2 pr-4">Supabase</td>
                    <td className="py-2">Signed-in submissions deleted with account; anonymous submissions retained</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Zikr progress</td>
                    <td className="py-2 pr-4">Device (localStorage)</td>
                    <td className="py-2">Until cleared</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Account (email, OAuth identity)</td>
                    <td className="py-2 pr-4">Supabase Auth</td>
                    <td className="py-2">Until account deleted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location and external services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Location access is optional. If you choose automatic location, your coordinates
              are used for prayer times, Qibla, nearby mosques and halal food. You can instead
              search for a city. Coordinates are saved on this device and may be saved to your
              Supabase profile when signed in.
            </p>
            <p>
              Coordinates or city searches are sent through our server to Nominatim/OpenStreetMap,
              Overpass, Geoapify or AlAdhan as needed for the feature you request. Map tiles load
              from OpenStreetMap. Quran text and audio, translations, tafsir and hadith are loaded
              from AlQuran Cloud, Quran.com, Islamic Network and HadithAPI.com. These providers
              may receive network information such as your IP address. We do not control their
              independent retention practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              We use Vercel Analytics for page visits and Speed Insights for performance
              measurements. Vercel processes these events to help us improve the app.
              We do not use them for advertising or cross-app tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Feedback submissions (problem reports and suggestions) are stored in Supabase.
              Submissions are anonymous by default. If you are signed in, your user ID may be
              attached for admin context only. Feedback includes page path, type, content,
              timestamp, and browser/device info. Feedback linked to your account is deleted
              with it. Anonymous submissions cannot be identified for account deletion.
              Users cannot view submitted feedback.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Your Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              Signed-in users can delete their account and all associated cloud data at any time.
              Device-local data is cleared as part of that process.
            </p>
            <Button variant="outline" asChild>
              <Link href="/privacy/delete-account">Delete account and data</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Questions about this policy:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
