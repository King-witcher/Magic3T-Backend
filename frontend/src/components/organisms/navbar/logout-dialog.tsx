import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LogoutDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-gold-1 uppercase tracking-wide">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="font-sans text-base text-grey-1 mt-3">
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} size="sm">
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
