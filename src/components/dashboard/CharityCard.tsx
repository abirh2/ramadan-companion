'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'

export function CharityCard() {
  return (
    <ProtectedFeature
      title="Charity Tracker"
      description="Sign in to track your sadaqah and zakat donations"
    >
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Charity Tracker
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">This Ramadan</p>
              <p className="text-xl font-semibold">$0.00</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">All Time</p>
              <p className="text-xl font-semibold">$0.00</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Track your sadaqah and zakat donations
          </p>
        </CardContent>
      </Card>
    </ProtectedFeature>
  )
}

