import { Button } from './button';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDelete({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-[400px] mx-4 rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute right-3 top-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 p-5 pb-0">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{title || 'Confirm Delete'}</h2>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
