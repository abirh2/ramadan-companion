import Link from 'next/link'

export function Footer() {
  return (
    <footer className="app-footer hidden border-t bg-background md:block">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
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
            <span className="text-muted-foreground/50">•</span>
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link 
              href="/privacy/delete-account" 
              className="hover:text-foreground transition-colors"
            >
              Delete Account
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
