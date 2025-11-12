'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MapPin } from 'lucide-react'

export function PlacesCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nearby Places
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mosques" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mosques">Mosques</TabsTrigger>
            <TabsTrigger value="halal-food">Halal Food</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mosques" className="mt-4 space-y-3">
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find nearby mosques with prayer times and facilities
              </p>
              <p className="text-xs text-accent font-medium mt-3">
                Coming Soon
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="halal-food" className="mt-4 space-y-3">
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover halal restaurants and markets near you
              </p>
              <p className="text-xs text-accent font-medium mt-3">
                Coming Soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

