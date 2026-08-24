'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string | undefined;
  description?: string | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  destructive?: boolean | undefined;
}

/**
 * Dialog konfirmasi terpusat pengganti `window.confirm()` yang tidak konsisten
 * dengan design system. Contoh pemakaian:
 *
 * ```tsx
 * const [confirmOpen, setConfirmOpen] = useState(false);
 * <ConfirmDialog
 *   open={confirmOpen}
 *   onOpenChange={setConfirmOpen}
 *   onConfirm={handleDelete}
 *   title="Hapus data?"
 *   description="Tindakan ini tidak dapat dibatalkan."
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Yakin?',
  description = 'Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  destructive = true,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border border-border text-foreground rounded-2xl shadow-xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-black text-lg text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={busy}
            className={`px-4 py-2 font-bold text-2xs rounded-xl cursor-pointer text-primary-foreground ${
              destructive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/95'
            }`}
          >
            {busy ? 'Memproses...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
