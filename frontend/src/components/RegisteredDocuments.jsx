import React, { useState } from 'react';
import { QrCode, Printer, AlertCircle } from 'lucide-react';
import { getStatusColor } from '../services/utils';
import { files } from '../api/client';
import { TorQrModal } from './TorQrModal';
import { TorPrintModal } from './TorPrintModal';

export const RegisteredDocuments = ({ records, onStatusChange }) => {
  const [qrRecord, setQrRecord] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [printPdfUrl, setPrintPdfUrl] = useState(null);
  const [printingDcn, setPrintingDcn] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this document?')) {
      return;
    }
    
    setRevokingId(id);
    try {
      await onStatusChange(id, 'Revoked');
    } catch (err) {
      alert(err.message || 'Failed to revoke document');
    } finally {
      setRevokingId(null);
    }
  };

  const handleClosePrint = () => {
    if (printPdfUrl) URL.revokeObjectURL(printPdfUrl);
    setPrintPdfUrl(null);
    setPrintRecord(null);
  };

  const handlePrint = async (record) => {
    if (!record.uploadedFileName) {
      alert('No PDF file is attached to this TOR.');
      return;
    }

    setPrintingDcn(record.dcn);
    try {
      const blob = await files.download(record.dcn);
      const url = URL.createObjectURL(blob);
      setPrintPdfUrl(url);
      setPrintRecord(record);
    } catch (err) {
      alert(err.message || 'Could not load the TOR PDF for printing.');
    } finally {
      setPrintingDcn(null);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registered Documents</h1>
          <p className="text-slate-600">View and manage all registered Transcript of Records</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-slate-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Active</p>
            <p className="text-3xl font-bold text-green-600">{records.filter(r => r.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Expired</p>
            <p className="text-3xl font-bold text-gray-600">{records.filter(r => r.status === 'Expired').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Revoked</p>
            <p className="text-3xl font-bold text-red-600">{records.filter(r => r.status === 'Revoked').length}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">DCN</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Issued</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">File</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.studentId}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{record.fullName}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">{record.dcn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(record.dateIssued).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-block max-w-xs truncate" title={record.uploadedFileName}>
                        {record.uploadedFileName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrint(record)}
                          disabled={!record.uploadedFileName || printingDcn === record.dcn}
                          className="inline-flex items-center gap-1 px-3 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition disabled:opacity-40"
                          title="Print stamped TOR PDF"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {printingDcn === record.dcn ? '…' : 'Print'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrRecord(record)}
                          disabled={!record.verificationToken}
                          className="inline-flex items-center gap-1 px-3 py-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded transition disabled:opacity-40"
                          title="View verification QR code"
                        >
                          <QrCode className="w-4 h-4" />
                          <span className="text-xs font-semibold">QR</span>
                        </button>
                        {record.status !== 'Revoked' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(record.id)}
                            disabled={revokingId === record.id}
                            className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition disabled:opacity-40"
                            title="Revoke this document"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                              {revokingId === record.id ? '…' : 'Revoke'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {records.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No registered documents yet.</p>
            <p className="text-slate-500">Create a new TOR using the "Issue New TOR" module.</p>
          </div>
        )}
      </div>

      {qrRecord && <TorQrModal record={qrRecord} onClose={() => setQrRecord(null)} />}
      {printRecord && printPdfUrl && (
        <TorPrintModal record={printRecord} pdfUrl={printPdfUrl} onClose={handleClosePrint} />
      )}
    </div>
  );
};
