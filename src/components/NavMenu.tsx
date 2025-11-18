'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, BookOpen, Clock, Heart, DollarSign, MessageCircle, Sparkles, Compass } from 'lucide-react'

export function NavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Features</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/quran">
          <DropdownMenuItem className="cursor-pointer">
            <BookOpen className="h-4 w-4 mr-2" />
            Quran Browser
          </DropdownMenuItem>
        </Link>
        
        <Link href="/times">
          <DropdownMenuItem className="cursor-pointer">
            <Clock className="h-4 w-4 mr-2" />
            Prayer Times
          </DropdownMenuItem>
        </Link>
        
        <Link href="/times#qibla">
          <DropdownMenuItem className="cursor-pointer">
            <Compass className="h-4 w-4 mr-2" />
            Qibla Finder
          </DropdownMenuItem>
        </Link>
        
        <Link href="/quran-hadith">
          <DropdownMenuItem className="cursor-pointer">
            <Sparkles className="h-4 w-4 mr-2" />
            Daily Quran & Hadith
          </DropdownMenuItem>
        </Link>
        
        <Link href="/charity">
          <DropdownMenuItem className="cursor-pointer">
            <DollarSign className="h-4 w-4 mr-2" />
            Charity Tracker
          </DropdownMenuItem>
        </Link>
        
        <Link href="/favorites">
          <DropdownMenuItem className="cursor-pointer">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </DropdownMenuItem>
        </Link>
        
        <Link href="/zikr">
          <DropdownMenuItem className="cursor-pointer">
            <MessageCircle className="h-4 w-4 mr-2" />
            Zikr & Duas
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

