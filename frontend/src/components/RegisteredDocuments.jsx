import { useRef, useState } from 'react';
import { QrCode, Printer, AlertCircle } from 'lucide-react';
import { getStatusColor } from '../services/utils';
import { files } from '../api/client';
import { printPdfFromUrl } from '../services/printPdf';
import { TorQrModal } from './TorQrModal';
import { FeedbackMessage } from './FeedbackMessage';
import { ConfirmDialog } from './ConfirmDialog';

export const RegisteredDocuments = ({ records, revokedCount = 0, onRevoke }) => {
  const [qrRecord, setQrRecord] = useState(null);
  const [printingDcn, setPrintingDcn] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [pendingRevoke, setPendingRevoke] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [revokeError, setRevokeError] = useState('');
  const revokeLockRef = useRef(false);
  const printLockRef = useRef(false);

  const handleRevoke = async () => {
    if (!pendingRevoke || revokeLockRef.current) return;
    revokeLockRef.current = true;
    setRevokingId(pendingRevoke.id);
    setRevokeError('');
    setFeedback(null);
    try {
      await onRevoke(pendingRevoke.id);
      setFeedback({ tone: 'success', title: 'TOR revoked successfully', message: `${pendingRevoke.dcn} was removed from the list and its PDF deleted. QR and DCN verification will show Revoked.` });
      setPendingRevoke(null);
    } catch (err) {
      setRevokeError(`${err.message || 'The revocation could not be confirmed.'} Review the record before trying again.`);
    } finally {
      revokeLockRef.current = false;
      setRevokingId(null);
    }
  };

  const handlePrint = async (record) => {
    if (printLockRef.current) return;
    printLockRef.current = true;
    setFeedback(null);
    setPrintingDcn(record.dcn);
    const previewWindow = window.open('', '_blank');
    try {
      if (!previewWindow) {
        throw new Error('Please allow pop-ups for this site to preview the TOR PDF.');
      }
      const blob = await files.download(record.dcn);
      await printPdfFromUrl(blob, previewWindow);
      setFeedback({ tone: 'success', title: 'PDF opened', message: `${record.dcn} is open in the print preview tab. Review it there and use the print controls.` });
    } catch (err) {
      previewWindow?.close();
      setFeedback({ tone: 'error', title: 'PDF could not be opened', message: err.message || 'Try opening the PDF again. If the problem continues, contact your system administrator.' });
    } finally {
      printLockRef.current = false;
      setPrintingDcn(null);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registered Documents</h1>
          <p className="text-slate-600">Use Open PDF to review or print a TOR, View QR to display its verification code, or Revoke TOR to invalidate it.</p>
        </div>

        {feedback && <div className="mb-6"><FeedbackMessage tone={feedback.tone} title={feedback.title}>{feedback.message}</FeedbackMessage></div>}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-slate-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Active</p>
            <p className="text-3xl font-bold text-green-600">{records.filter(r => r.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Revoked</p>
            <p className="text-3xl font-bold text-red-600">{revokedCount}</p>
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
                          disabled={!record.dcn || Boolean(printingDcn) || Boolean(revokingId)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition disabled:opacity-40"
                          title="Print stamped TOR PDF"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {printingDcn === record.dcn ? 'Opening PDF…' : 'Open PDF'}
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
                          <span className="text-xs font-semibold">View QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPendingRevoke(record); setRevokeError(''); }}
                          disabled={Boolean(revokingId) || Boolean(printingDcn)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition disabled:opacity-40"
                          title="Revoke and remove this TOR"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {revokingId === record.id ? 'Revoking…' : 'Revoke TOR'}
                          </span>
                        </button>
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
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 sm:p-12 text-center">
            <p className="text-slate-600 text-lg">No registered documents yet.</p>
            <p className="text-slate-500">Create a new TOR using the "Issue New TOR" module.</p>
          </div>
        )}
      </div>

      {qrRecord && <TorQrModal record={qrRecord} onClose={() => setQrRecord(null)} />}
      {pendingRevoke && (
        <ConfirmDialog title="Revoke this TOR?" confirmLabel="Revoke TOR" busy={Boolean(revokingId)}
          onConfirm={handleRevoke} onCancel={() => setPendingRevoke(null)}>
          <p><strong>{pendingRevoke.fullName}</strong><br /><span className="font-mono">{pendingRevoke.dcn}</span></p>
          <p>This removes the TOR from Registered Documents and deletes its PDF. Future QR scans and DCN lookups will show <strong>Revoked</strong>.</p>
          <p>This action cannot be undone from this screen. Confirm only if this TOR should no longer be used.</p>
          {revokeError && <FeedbackMessage tone="error" title="Revocation could not be confirmed">{revokeError}</FeedbackMessage>}
        </ConfirmDialog>
      )}
    </div>
  );
};
