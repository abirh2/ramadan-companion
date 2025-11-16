'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Linkedin, Mail, ExternalLink, Copy, Check, Smartphone, Monitor, Apple } from 'lucide-react'
import { FeedbackButton } from '@/components/FeedbackButton'

function AboutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('creator')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['creator', 'app', 'install', 'acknowledgements'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = value === 'creator' ? '/about' : `/about?tab=${value}`
    router.push(url, { scroll: false })
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText('abirh@alumni.upenn.edu')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground mt-2">Learn more about Ramadan Companion and its creator</p>
      </div>

      {/* Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="app">About App</TabsTrigger>
            <TabsTrigger value="install">Install Guide</TabsTrigger>
            <TabsTrigger value="acknowledgements">Acknowledgements</TabsTrigger>
          </TabsList>

          {/* Creator Tab */}
          <TabsContent value="creator" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted flex-shrink-0">
                    <Image
                      src="/creator-profile.jpg"
                      alt="Abir Hossain"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">Abir Hossain</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Software Developer • University of Pennsylvania
                    </CardDescription>
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href="https://www.linkedin.com/in/abir-hossain-0b6a4ab3/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={copyEmail}
                      >
                        <Mail className="h-4 w-4" />
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            abirh@alumni.upenn.edu
                            <Copy className="h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I'm a software developer passionate about building meaningful technology that serves the Muslim community. 
                    As a practicing Muslim, I understand the challenges of maintaining daily worship routines in our modern, 
                    fast-paced world. Ramadan Companion is my contribution to making Islamic practice more accessible and organized.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Education</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">MSE in Computer and Information Science</span>
                      <br />
                      University of Pennsylvania • May 2025
                    </p>
                    <p>
                      <span className="font-medium text-foreground">BSE in Computer Engineering</span>
                      <br />
                      University of Pennsylvania • May 2025
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Professional Experience</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Developer I</span>
                      <br />
                      FTI Consulting - Data & Analytics Software Solutions • New York City, NY
                      <br />
                      <span className="text-xs">July 2025 - Present</span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed">
                      Building full-stack web applications using React, Laravel, and modern testing frameworks 
                      to support client litigation and compliance projects.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Notable Projects</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Langmates</p>
                      <p className="text-xs leading-relaxed">
                        Led development of an AI-powered platform for K-12 language learning, integrating OpenAI APIs 
                        for multilingual conversations. Winner of the Norman Gross Senior Design Award.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">BlissAlarm IoT Prayer Device</p>
                      <p className="text-xs leading-relaxed">
                        Developed a full-stack hardware and software IoT device to notify users of Islamic prayer times. 
                        Created custom PCBA with WiFi MCU and wrote custom drivers for device peripherals.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About App Tab */}
          <TabsContent value="app" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Ramadan Companion</CardTitle>
                <CardDescription>
                  A modern, minimal web app to assist with daily worship and reflection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Mission</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ramadan Companion is designed to help Muslims maintain their daily worship routines, especially during 
                    the blessed month of Ramadan. Our goal is to provide accurate, accessible tools for prayer times, 
                    Quranic reflection, charitable giving, and spiritual growth—all while respecting your privacy and data.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Key Features (V1)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Prayer Times & Qibla:</strong> Accurate prayer times based on your location with multiple calculation methods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Ramadan Countdown:</strong> Track days until Ramadan and view Hijri calendar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Quran & Hadith:</strong> Daily inspirational verses and authentic hadith with translations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Charity Tracker:</strong> Log and track your sadaqah and zakat donations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Zikr Counter:</strong> Digital tasbih with customizable phrases and duas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Places Finder:</strong> Locate nearby mosques and halal restaurants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong className="text-foreground">Favorites:</strong> Save your favorite Quran verses and hadiths</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Technology Stack</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    Built with modern web technologies for performance, reliability, and user experience:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><span className="font-medium text-foreground">Frontend:</span> Next.js 16, React 19, TypeScript</div>
                    <div><span className="font-medium text-foreground">UI:</span> TailwindCSS, shadcn/ui, Lucide Icons</div>
                    <div><span className="font-medium text-foreground">Backend:</span> Next.js API Routes, Supabase</div>
                    <div><span className="font-medium text-foreground">Database:</span> PostgreSQL (Supabase)</div>
                    <div><span className="font-medium text-foreground">Auth:</span> Supabase Auth (Email + OAuth)</div>
                    <div><span className="font-medium text-foreground">Maps:</span> MapLibre GL, OpenStreetMap</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Privacy-First Principles</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Your data is stored securely with Supabase and protected by Row-Level Security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Most features work without authentication—create an account only when needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Location data is stored locally on your device unless you choose to save it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>No tracking, no ads, no third-party analytics</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Future Roadmap</h3>
                  <p className="text-sm text-muted-foreground">
                    Planned features include prayer notifications, Quran audio recitation, advanced zikr tracking, 
                    and community features for sharing reflections and charitable opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Install Guide Tab */}
          <TabsContent value="install" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Install as App</CardTitle>
                <CardDescription>
                  Install Ramadan Companion on your device for a native app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benefits */}
                <div>
                  <h3 className="font-semibold mb-3">Why Install?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong className="text-foreground">Works Offline:</strong> Access prayer times, Quran, and zikr even without internet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong className="text-foreground">Home Screen Shortcut:</strong> Quick access from your device's home screen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong className="text-foreground">Faster Loading:</strong> Instant startup with cached content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong className="text-foreground">Notifications (Coming Soon):</strong> Get prayer time reminders on your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong className="text-foreground">Full Screen:</strong> Distraction-free experience without browser UI</span>
                    </li>
                  </ul>
                </div>

                {/* iOS Instructions */}
                <div className="border-l-4 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Apple className="h-5 w-5" />
                    <h3 className="font-semibold">iOS (iPhone/iPad)</h3>
                  </div>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Open this website in <strong className="text-foreground">Safari</strong></li>
                    <li>Tap the <strong className="text-foreground">Share button</strong> (square with up arrow) at the bottom of the screen</li>
                    <li>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></li>
                    <li>Tap <strong className="text-foreground">"Add"</strong> in the top right corner</li>
                    <li>The app icon will appear on your home screen</li>
                  </ol>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                    Note: Installation must be done through Safari browser. Other browsers on iOS don't support app installation.
                  </p>
                </div>

                {/* Android Instructions */}
                <div className="border-l-4 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="h-5 w-5" />
                    <h3 className="font-semibold">Android</h3>
                  </div>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Open this website in <strong className="text-foreground">Chrome</strong> or <strong className="text-foreground">Edge</strong></li>
                    <li>Tap the <strong className="text-foreground">menu button</strong> (three dots) in the top right</li>
                    <li>Tap <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></li>
                    <li>Tap <strong className="text-foreground">"Install"</strong> to confirm</li>
                    <li>The app icon will appear in your app drawer and home screen</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tip: You may also see an automatic install banner at the bottom of the page after using the app a few times.
                  </p>
                </div>

                {/* Desktop Instructions */}
                <div className="border-l-4 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-5 w-5" />
                    <h3 className="font-semibold">Desktop (Chrome, Edge, Brave)</h3>
                  </div>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Look for the <strong className="text-foreground">install icon</strong> in the address bar (⊕ or 🔽)</li>
                    <li>Click the icon and select <strong className="text-foreground">"Install"</strong></li>
                    <li>The app will open in its own window</li>
                    <li>Access it from your taskbar, dock, or applications folder</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-3">
                    Alternative: Click the three-dot menu → "Install Ramadan Companion" or "Create shortcut"
                  </p>
                </div>

                {/* Troubleshooting */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-sm">Troubleshooting</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Don't see install option?</strong> Make sure you're using a supported browser (Safari on iOS, Chrome/Edge on Android/Desktop).
                    </p>
                    <p>
                      <strong className="text-foreground">Installation failed?</strong> Try refreshing the page and attempting again. Ensure you have stable internet connection.
                    </p>
                    <p>
                      <strong className="text-foreground">Already installed but can't find it?</strong> Check your home screen, app drawer (Android), or applications folder (Desktop).
                    </p>
                  </div>
                </div>

                {/* After Installation */}
                <div>
                  <h3 className="font-semibold mb-2">After Installation</h3>
                  <p className="text-sm text-muted-foreground">
                    Once installed, you can launch Ramadan Companion directly from your home screen or app drawer. 
                    The app will remember your preferences, work offline, and provide a seamless experience across all your devices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Acknowledgements Tab */}
          <TabsContent value="acknowledgements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acknowledgements</CardTitle>
                <CardDescription>
                  This app is built on the shoulders of open-source contributors and public APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">APIs & Data Sources</h3>
                  <div className="space-y-3 text-sm">
                    <div className="border-l-2 border-primary/20 pl-3">
                      <p className="font-medium text-foreground">AlAdhan API</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Prayer times, Hijri calendar, and Qibla direction calculations
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠ Community-driven. Accuracy varies by region. Always verify with local mosque.
                      </p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-3">
                      <p className="font-medium text-foreground">AlQuran Cloud API</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Quran text and translations in multiple languages
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠ Translations are interpretations. Consult qualified scholars for detailed understanding.
                      </p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-3">
                      <p className="font-medium text-foreground">HadithAPI.com</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Authentic hadith collections (Sahih Bukhari & Sahih Muslim) with English translations
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠ Check authentication grades and chains. Verify with Islamic scholars when needed.
                      </p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-3">
                      <p className="font-medium text-foreground">OpenStreetMap Overpass API</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Mosque locations and facility information
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠ Community-contributed data. May be incomplete or outdated. Verify hours and locations.
                      </p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-3">
                      <p className="font-medium text-foreground">Nominatim (OpenStreetMap)</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Geocoding and address search services
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠ Volunteer-run infrastructure with rate limits. Service availability may vary.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Open Source Libraries</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">Next.js (Vercel)</p>
                      <p className="text-muted-foreground">MIT License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">React (Meta)</p>
                      <p className="text-muted-foreground">MIT License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">Supabase</p>
                      <p className="text-muted-foreground">Apache 2.0 License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">TailwindCSS</p>
                      <p className="text-muted-foreground">MIT License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">shadcn/ui (Radix UI)</p>
                      <p className="text-muted-foreground">MIT License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">MapLibre GL</p>
                      <p className="text-muted-foreground">BSD 3-Clause License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">Recharts</p>
                      <p className="text-muted-foreground">MIT License</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="font-medium text-foreground">Lucide Icons</p>
                      <p className="text-muted-foreground">ISC License</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    We are deeply grateful to all open-source contributors whose work makes this app possible.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Important Disclaimers</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 mt-1">⚠</span>
                      <span>
                        <strong className="text-foreground">Prayer Times:</strong> Calculated mathematically using established methods. 
                        Always verify with your local mosque or Islamic center for the most accurate times.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 mt-1">⚠</span>
                      <span>
                        <strong className="text-foreground">Religious Content:</strong> Quran translations and hadith interpretations 
                        are provided for convenience. For detailed understanding and religious rulings, always consult qualified scholars.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 mt-1">⚠</span>
                      <span>
                        <strong className="text-foreground">Location Data:</strong> Mosque and restaurant information is community-contributed. 
                        Always verify operating hours, prayer times, and locations before visiting.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 mt-1">⚠</span>
                      <span>
                        <strong className="text-foreground">Use at Your Own Discretion:</strong> This app is provided as-is for 
                        informational and organizational purposes. The developer is not responsible for any decisions made based on 
                        the information provided.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground italic text-center">
                    May Allah accept this humble effort and make it beneficial for the Ummah. Ameen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Feedback Button */}
      <FeedbackButton pagePath="/about" />
    </div>
  )
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AboutContent />
    </Suspense>
  )
}

