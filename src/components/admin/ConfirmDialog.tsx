import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, Trash2 } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  variant?: 'danger' | 'success' | 'primary';
  title: string;
  description: ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    badge: 'bg-red-500/15 border-red-500/30 text-red-400',
    button: 'bg-red-600 hover:bg-red-500',
    Icon: Trash2,
  },
  success: {
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-500',
    Icon: CheckCircle2,
  },
  primary: {
    badge: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    button: 'bg-orange-600 hover:bg-orange-500',
    Icon: Info,
  },
};

export function ConfirmDialog({
  open,
  variant = 'danger',
  title,
  description,
  confirmLabel,
  busyLabel,
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, busy, onCancel]);

  const { badge, button, Icon } = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            if (!busy) onCancel();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl border shrink-0 ${badge}`}>
                <Icon size={18} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 id="confirm-dialog-title" className="text-sm font-semibold text-white">
                  {title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition disabled:opacity-50 ${button}`}
              >
                {busy ? busyLabel || confirmLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
