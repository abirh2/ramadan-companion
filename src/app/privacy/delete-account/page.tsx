'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Mail, Trash2 } from 'lucide-react'
import { clearLocalUserData } from '@/lib/clearLocalUserData'

const CONTACT_EMAIL = 'abirh@alumni.upenn.edu'
const CONFIRM_TEXT = 'DELETE'

export default function DeleteAccountPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/delete', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      clearLocalUserData()
      await signOut()
      setDialogOpen(false)
      router.push('/?accountDeleted=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const resetDialog = () => {
    setConfirmText('')
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href="/privacy">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Privacy Policy
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Delete your Deen Companion account and data</h1>
        <p className="text-muted-foreground mt-2">
          Request permanent deletion of your account and associated cloud data.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How to request deletion</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Sign in to your Deen Companion account.</li>
              <li>Review what data will be deleted below.</li>
              <li>Click &quot;Delete my account&quot; and confirm by typing DELETE.</li>
              <li>Your account and cloud data are removed immediately.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data deleted</CardTitle>
            <CardDescription>
              Removed immediately when you delete your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Account credentials (email, OAuth identity)</li>
              <li>Profile settings (display name, location, prayer calculation preferences)</li>
              <li>Charity and donation records</li>
              <li>Saved Quran ayahs and hadith favorites</li>
              <li>Quran reading bookmarks</li>
              <li>Prayer completion history</li>
              <li>Push notification subscriptions</li>
              <li>Device-local app preferences (cleared from this browser/device)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data retained</CardTitle>
            <CardDescription>
              Anonymized data kept for app improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                Feedback you submitted may be retained without your user ID attached
                (anonymous after deletion)
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Cloud data is deleted immediately upon self-service deletion. Email-based
              requests are processed within 30 days.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device-local data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Some data (location, theme, zikr progress, guest prayer tracking) is stored only
              on your device. Self-service deletion clears it from this browser. Uninstalling
              the app also removes native local storage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete your account</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            ) : user ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{user.email}</span>
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    resetDialog()
                    setDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete my account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to delete your account and associated cloud data.
                </p>
                <Button onClick={() => setShowLoginModal(true)}>Sign in</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cannot sign in?</CardTitle>
            <CardDescription>
              Email us to request account deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you cannot access your account, email us with the address associated with
              your Deen Companion account. We will verify ownership and delete your data within
              30 days.
            </p>
            <Button variant="outline" asChild>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Deen Companion account deletion request')}&body=${encodeURIComponent('Please delete my Deen Companion account and associated data.\n\nEmail associated with my account:\n\n')}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email {CONTACT_EMAIL}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetDialog()
        }}
      >
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription>
              This cannot be undone. All your cloud data will be permanently deleted.
              Type {CONFIRM_TEXT} to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_TEXT}
              disabled={deleting}
              aria-label={`Type ${CONFIRM_TEXT} to confirm deletion`}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || confirmText !== CONFIRM_TEXT}
            >
              {deleting ? 'Deleting...' : 'Delete my account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
