import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Printer } from 'lucide-react';
import { generateDCN } from '../services/utils';
import { buildVerificationUrl, getPublicOrigin, isLocalOnlyOrigin } from '../services/verificationUrl';
import { stampTorPdf } from '../services/pdfStampService';
import { tor, files } from '../api/client';
import { SuccessModal } from './SuccessModal';

const emptyForm = () => ({
  studentId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dcn: '',
  dateIssued: new Date().toISOString().split('T')[0],
  uploadedFileName: '',
});

export const IssueNewTOR = ({ onRecordCreated }) => {
  const [formData, setFormData] = useState(emptyForm());
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [mobileVerifyBase, setMobileVerifyBase] = useState('');
  const [successRecord, setSuccessRecord] = useState(null);
  const previewUrlRef = useRef(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    const base = getPublicOrigin();
    setMobileVerifyBase(isLocalOnlyOrigin(base) ? '' : base);
  }, []);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  useEffect(() => () => revokePreviewUrl(), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setPdfFile = (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setUploadedFile(file);
    setFormData((prev) => ({ ...prev, uploadedFileName: file.name }));
    revokePreviewUrl();
    setPreviewPdfUrl(null);
    setPreviewRecord(null);
  };

  const handleFileUpload = (e) => setPdfFile(e.target.files?.[0]);

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPdfFile(e.dataTransfer.files?.[0]);
  };

  const handleGenerateDCN = () => {
    setFormData((prev) => ({ ...prev, dcn: generateDCN() }));
  };

  const handleReset = () => {
    setFormData(emptyForm());
    setUploadedFile(null);
    revokePreviewUrl();
    setPreviewPdfUrl(null);
    setPreviewRecord(null);
  };

  const resolveTorRecord = async () => {
    const studentId = formData.studentId.trim();
    const firstName = formData.firstName.trim();
    const middleName = formData.middleName.trim();
    const lastName = formData.lastName.trim();
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const dcn = formData.dcn.trim();

    try {
      const { record } = await tor.create(studentId, fullName, dcn, formData.dateIssued, 'Active');
      return record;
    } catch (err) {
      const msg = err.message || '';
      const lower = msg.toLowerCase();
      if (lower.includes('revoked') || !lower.includes('dcn already exists')) {
        throw err;
      }
      const { record } = await tor.getByDcn(dcn);
      if (
        record.studentId?.toUpperCase() !== studentId.toUpperCase() ||
        record.fullName?.toUpperCase() !== fullName.toUpperCase()
      ) {
        throw err;
      }
      return record;
    }
  };

  const handleRegisterAndGenerate = async () => {
    if (!formData.studentId?.trim() || !formData.firstName?.trim() || !formData.lastName?.trim() || !formData.dcn?.trim() || !uploadedFile) {
      alert('Please complete all required fields and upload the TOR PDF');
      return;
    }

    if (submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const record = await resolveTorRecord();

      const verificationUrl = buildVerificationUrl(record.verificationToken);
      const stampedBlob = await stampTorPdf(uploadedFile, {
        dcn: record.dcn,
        verificationUrl,
        studentId: record.studentId,
        fullName: record.fullName,
      });

      const stampedFile = new File([stampedBlob], `TOR-${record.dcn}.pdf`, { type: 'application/pdf' });
      await files.upload(record.dcn, stampedFile);

      await onRecordCreated(record);

      revokePreviewUrl();
      const url = URL.createObjectURL(stampedBlob);
      previewUrlRef.current = url;
      setPreviewPdfUrl(url);
      setPreviewRecord({
        ...record,
        verificationUrl,
        uploadedFileName: stampedFile.name,
      });

      setSuccessRecord({
        ...record,
        verificationUrl,
        uploadedFileName: stampedFile.name,
      });
    } catch (err) {
      const message = err.message || 'Failed to register document';
      if (message.includes('QR codes cannot use localhost')) {
        alert(`${message}\n\nRestart npm run dev, update .env.local with your Wi-Fi IP, then try again.`);
      } else {
        alert(message);
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessRecord(null);
  };

  const handlePrint = () => {
    const frame = document.getElementById('tor-print-frame');
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <>
      <SuccessModal
        open={Boolean(successRecord)}
        title="TOR Registered Successfully"
        message="The transcript has been registered, stamped with QR code and DCN, and saved. You can register another TOR or open Registered Documents from the menu."
        dcn={successRecord?.dcn}
        studentName={successRecord?.fullName}
        confirmLabel="OK"
        onConfirm={handleSuccessConfirm}
        onClose={handleSuccessConfirm}
      />

    <div className="flex-1 bg-slate-100 p-6 lg:p-8 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Issue New Transcript of Records</h1>
          <p className="text-slate-600 text-sm mt-1">
            Register a TOR, embed verification QR and DCN on the PDF, then print for the student.
          </p>
        </header>

        {mobileVerifyBase ? (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <p className="font-semibold">Mobile QR verification URL</p>
            <p className="mt-1 font-mono text-xs break-all">{mobileVerifyBase}/verify?token=…</p>
            <p className="mt-2 text-blue-800/90">
              Phone must be on the same Wi‑Fi. After changing networks, restart <code className="text-xs">npm run dev</code> and
              register the TOR again so the PDF QR is updated.
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Mobile QR not configured</p>
            <p className="mt-1">
              Run <code className="text-xs bg-amber-100 px-1 rounded">npm run dev</code> (not plain vite) so your LAN IP is written to{' '}
              <code className="text-xs bg-amber-100 px-1 rounded">.env.local</code>. QR codes with localhost will not open on a phone.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Record Entry */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900">Record Entry</h2>
            <p className="text-sm text-slate-500 mb-5">Enter the official document details.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Student ID Number</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-00123"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Control No. (DCN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="dcn"
                    value={formData.dcn}
                    onChange={handleInputChange}
                    placeholder="e.g., DCN-0001"
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDCN}
                    className="px-3 py-2 text-xs font-semibold text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 shrink-0"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g., Juan"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="e.g., Perez"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g., Dela Cruz"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date Issued</label>
                <input
                  type="date"
                  name="dateIssued"
                  value={formData.dateIssued}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">TOR File Upload</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                  uploadedFile ? 'border-green-400 bg-green-50/50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
                }`}
              >
                {uploadedFile ? (
                  <div>
                    <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-sm">{uploadedFile.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFormData((prev) => ({ ...prev, uploadedFileName: '' }));
                      }}
                      className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Replace file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="font-medium text-slate-800">Drop PDF here or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">Soft copy of the Transcript of Records</p>
                    <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" id="tor-pdf-input" />
                    <label
                      htmlFor="tor-pdf-input"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                    >
                      <Upload className="w-4 h-4" />
                      Browse PDF
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRegisterAndGenerate}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Generating…' : 'Register & Generate'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border-2 border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Reset
              </button>
            </div>
          </section>

          {/* Print Preview */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[520px]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Print Preview</h2>
                <p className="text-sm text-slate-500">Document receipt with verification QR code and DCN.</p>
              </div>
              {previewPdfUrl && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              )}
            </div>

            {previewPdfUrl && previewRecord ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                  <p>
                    <span className="font-semibold">DCN:</span>{' '}
                    <span className="font-mono">{previewRecord.dcn}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Student:</span> {previewRecord.studentId} — {previewRecord.fullName}
                  </p>
                  <p className="text-blue-700">QR and DCN are embedded on every page for mobile verification.</p>
                </div>
                <iframe
                  id="tor-print-frame"
                  title="TOR print preview"
                  src={previewPdfUrl}
                  className="flex-1 w-full min-h-[420px] rounded-lg border border-slate-200 bg-slate-100"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center px-6 py-16">
                <FileText className="w-14 h-14 text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">Print preview will appear here after registration.</p>
                <p className="text-slate-400 text-sm mt-2 max-w-xs">
                  The uploaded PDF will include a verification QR code and DCN on each page.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
    </>
  );
};
