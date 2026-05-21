import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export const SuccessModal = ({
  open,
  title = 'Success',
  message,
  dcn,
  studentName,
  confirmLabel = 'View Registered Documents',
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={2.25} />
            </div>
            <h2 id="success-modal-title" className="text-xl font-bold text-slate-900">
              {title}
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>

          {(dcn || studentName) && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm space-y-1">
              {studentName && (
                <p>
                  <span className="font-semibold text-slate-700">Graduate:</span>{' '}
                  <span className="text-slate-900">{studentName}</span>
                </p>
              )}
              {dcn && (
                <p>
                  <span className="font-semibold text-slate-700">DCN:</span>{' '}
                  <span className="font-mono font-bold text-green-800">{dcn}</span>
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/20"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
