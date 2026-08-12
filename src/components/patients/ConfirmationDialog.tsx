import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <Card variant="flat" className="w-full max-w-md bg-white shadow-xl border border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-700'
                  : variant === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-teal-100 text-teal-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-900 font-bold">{title}</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Confirmation required before proceeding
              </CardDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
            <strong>Note:</strong> This frontend prototype uses mock state. No permanent database changes will occur.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              isLoading={isLoading}
              leftIcon={variant === 'danger' ? <Trash2 className="w-4 h-4" /> : undefined}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
