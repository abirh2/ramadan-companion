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
import { Menu, BookOpen, BookOpenText, Clock, Heart, DollarSign, MessageCircle, Sparkles, Compass } from 'lucide-react'

export function NavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" aria-label="Features menu">
        <DropdownMenuLabel>Features</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/quran">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
            Quran Browser
          </DropdownMenuItem>
        </Link>
        
        <Link href="/hadith">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <BookOpenText className="h-4 w-4 mr-2" aria-hidden="true" />
            Hadith Browser
          </DropdownMenuItem>
        </Link>
        
        <Link href="/times">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
            Prayer Times
          </DropdownMenuItem>
        </Link>
        
        <Link href="/times#qibla">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <Compass className="h-4 w-4 mr-2" aria-hidden="true" />
            Qibla Finder
          </DropdownMenuItem>
        </Link>
        
        <Link href="/quran-hadith">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
            Daily Quran & Hadith
          </DropdownMenuItem>
        </Link>
        
        <Link href="/charity">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <DollarSign className="h-4 w-4 mr-2" aria-hidden="true" />
            Charity Tracker
          </DropdownMenuItem>
        </Link>
        
        <Link href="/favorites">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <Heart className="h-4 w-4 mr-2" aria-hidden="true" />
            Favorites
          </DropdownMenuItem>
        </Link>
        
        <Link href="/zikr">
          <DropdownMenuItem className="cursor-pointer" role="menuitem">
            <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Zikr & Duas
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

