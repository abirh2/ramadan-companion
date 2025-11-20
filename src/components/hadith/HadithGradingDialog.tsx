'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface HadithGradingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HadithGradingDialog({ open, onOpenChange }: HadithGradingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Hadith Grading System</DialogTitle>
          <DialogDescription>
            Understanding the authenticity levels of hadith narrations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sahih - Authentic */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Sahih
              </span>
              <span className="text-sm font-semibold">صحيح - Authentic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The highest level of authenticity. The chain of narration is continuous, all narrators are 
              reliable and trustworthy, and there are no defects in the transmission. Sahih hadiths are 
              considered the most dependable sources for Islamic rulings and beliefs.
            </p>
          </div>

          {/* Hasan - Good */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Hasan
              </span>
              <span className="text-sm font-semibold">حسن - Good</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Slightly less rigorous than Sahih but still acceptable for deriving Islamic rulings. 
              The chain may have minor weaknesses, such as narrators with slightly less precise memory, 
              but overall the hadith is considered reliable and authentic.
            </p>
          </div>

          {/* Da'eef - Weak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                Da&apos;eef
              </span>
              <span className="text-sm font-semibold">ضعيف - Weak</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Has weaknesses in the chain of narration or narrator reliability. This may include 
              broken chains, unknown narrators, or narrators with questionable memory. Da&apos;eef 
              hadiths are used with caution and are not relied upon for establishing core Islamic beliefs.
            </p>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground italic">
              Note: These gradings are scholarly assessments by hadith experts (muhaddithin) 
              who carefully evaluated the chain of narration and narrator reliability. 
              Understanding these classifications helps Muslims appreciate the rigorous 
              preservation of prophetic traditions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

