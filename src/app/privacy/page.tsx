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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Last updated: July 4, 2026
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Deen Companion is built with privacy in mind:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No ads or third-party tracking scripts</li>
              <li>Minimal data collection — most features work without an account</li>
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
                    <td className="py-2 pr-4">Donations, favorites, bookmarks, prayer tracking</td>
                    <td className="py-2 pr-4">Supabase (signed-in users only)</td>
                    <td className="py-2">Until account deleted</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Feedback</td>
                    <td className="py-2 pr-4">Supabase</td>
                    <td className="py-2">Retained; user link removed on account deletion</td>
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
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              We use Vercel Analytics and Speed Insights for aggregate, privacy-preserving
              performance metrics. These are first-party tools with no ad tracking or
              cross-site profiling.
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
              timestamp, and browser/device info. Users cannot view submitted feedback.
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
