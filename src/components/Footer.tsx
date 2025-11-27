import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-4xl px-4 py-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <Link 
              href="/about" 
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link 
              href="/about?tab=acknowledgements" 
              className="hover:text-foreground transition-colors"
            >
              Acknowledgements
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Deen Companion
          </p>
        </div>
      </div>
    </footer>
  )
}

