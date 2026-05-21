import React from 'react';
import { X, Printer } from 'lucide-react';

export const TorPrintModal = ({ record, pdfUrl, onClose }) => {
  if (!record || !pdfUrl) return null;

  const handlePrint = () => {
    const frame = document.getElementById('reg-doc-print-frame');
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">Print TOR</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {record.fullName} · <span className="font-mono text-blue-600">{record.dcn}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-4">
          <iframe
            id="reg-doc-print-frame"
            title={`TOR ${record.dcn}`}
            src={pdfUrl}
            className="w-full h-[min(60vh,520px)] rounded-lg border border-slate-200 bg-slate-100"
          />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
