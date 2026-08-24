'use client';

import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface ConfirmOptions {
  title?: string | undefined;
  description?: string | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  destructive?: boolean | undefined;
  onConfirm: () => void | Promise<void>;
}

/**
 * Hook dialog konfirmasi pengganti `window.confirm()`.
 *
 * ```tsx
 * const { ask, dialog } = useConfirmDialog();
 *
 * const handleDelete = (item: Item) =>
 *   ask({
 *     title: 'Hapus data?',
 *     description: 'Tindakan ini tidak dapat dibatalkan.',
 *     onConfirm: async () => { await deleteItem({ variables: { id: item.id } }); },
 *   });
 *
 * return (<div>...{dialog}</div>);
 * ```
 */
export function useConfirmDialog() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const ask = useCallback((o: ConfirmOptions) => setOpts(o), []);

  const dialog = (
    <ConfirmDialog
      open={!!opts}
      onOpenChange={(open) => {
        if (!open) setOpts(null);
      }}
      onConfirm={async () => {
        await opts?.onConfirm();
      }}
      title={opts?.title}
      description={opts?.description}
      confirmLabel={opts?.confirmLabel}
      cancelLabel={opts?.cancelLabel}
      destructive={opts?.destructive}
    />
  );

  return { ask, dialog };
}
