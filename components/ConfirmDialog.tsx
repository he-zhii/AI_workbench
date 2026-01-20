import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from './Button';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const icons = {
  danger: <AlertTriangle size={24} className="text-red-500" />,
  warning: <AlertCircle size={24} className="text-amber-500" />,
  info: <Info size={24} className="text-blue-500" />,
  success: <CheckCircle size={24} className="text-green-500" />,
};

const bgColors = {
  danger: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
};

export default function ConfirmDialog({
  isOpen,
  type = 'warning',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full border ${bgColors[type]} flex items-center justify-center`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-3 justify-end">
          <Button onClick={onCancel} variant="secondary">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={type === 'danger' ? 'danger' : 'primary'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
