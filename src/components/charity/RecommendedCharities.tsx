'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HeartHandshake, Sparkles } from 'lucide-react'

export function RecommendedCharities() {
  return (
    <Card className="rounded-xl border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Recommended Charities & Causes
        </CardTitle>
        <CardDescription>
          Coming soon - curated list of verified charitable organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2 max-w-md">
            <p className="text-sm text-muted-foreground">
              We&apos;re working on bringing you a carefully curated collection of trusted Islamic charities
              and humanitarian organizations.
            </p>
            <p className="text-xs text-muted-foreground">
              This will include charities focused on education, medical aid, disaster relief, orphan support,
              and more - all verified and easy to support.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

