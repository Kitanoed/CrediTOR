import React from 'react';
import QRCode from 'qrcode.react';
import { X } from 'lucide-react';
import { buildVerificationUrl } from '../services/verificationUrl';

export const TorQrModal = ({ record, onClose }) => {
  if (!record?.verificationToken) return null;

  const verificationUrl = buildVerificationUrl(record.verificationToken);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Verification QR Code</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">{record.fullName}</p>
          <p className="text-xs font-mono text-blue-600 mb-6">{record.dcn}</p>

          <div className="inline-flex p-4 bg-white border-2 border-slate-200 rounded-xl">
            <QRCode value={verificationUrl} size={220} level="H" includeMargin />
          </div>

          <p className="mt-4 text-xs text-slate-500">Scan with a phone camera to open the verification portal</p>

          <p className="mt-3 text-[10px] text-slate-400 break-all px-2">{verificationUrl}</p>
        </div>
      </div>
    </div>
  );
};
