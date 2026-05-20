import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button.tsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={onCancel} 
      />

      <div className="relative w-full max-w-md glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl z-10 transform scale-100 transition-all duration-300">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl ${
            isDanger 
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 font-sans">
              {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className={
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-transparent' 
                : ''
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
