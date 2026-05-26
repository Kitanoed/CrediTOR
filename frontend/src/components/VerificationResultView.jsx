import React from 'react';
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hash,
  CreditCard,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';
import { maskStudentId } from '../services/utils';

const ISSUING_OFFICE_DEFAULT = 'Office of the University Registrar — Main Campus';

export const VerificationPortalHeader = ({
  onSwitchToRegistrar,
  isRegistrarLoggedIn = false,
}) => (
  <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
    <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">CrediTOR</p>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            Transcript Verification
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchToRegistrar}
        className="shrink-0 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
      >
        {isRegistrarLoggedIn ? 'Registrar Portal' : 'Registrar Login'}
      </button>
    </div>
  </header>
);

const DetailRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 py-4 border-b border-slate-100 last:border-b-0">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-slate-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 text-base font-bold text-slate-900 break-words ${
          mono ? 'font-mono tracking-tight' : ''
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const formatDateIssued = (dateIssued) => {
  if (!dateIssued) return '—';
  return new Date(dateIssued).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const statusTheme = (status, verified, identityMatch = true) => {
  if (!identityMatch) {
    return {
      banner: 'bg-amber-600 border-amber-700',
      iconBg: 'bg-white/20',
      icon: AlertTriangle,
      overall: 'Identity Mismatch',
    };
  }
  if (verified && status === 'Active') {
    return {
      banner: 'bg-green-600 border-green-700',
      iconBg: 'bg-white/20',
      icon: CheckCircle2,
      overall: 'Verified',
    };
  }
  if (status === 'Revoked') {
    return {
      banner: 'bg-red-600 border-red-700',
      iconBg: 'bg-white/20',
      icon: XCircle,
      overall: 'Revoked',
    };
  }
  if (status === 'Expired') {
    return {
      banner: 'bg-amber-600 border-amber-700',
      iconBg: 'bg-white/20',
      icon: AlertTriangle,
      overall: 'Expired',
    };
  }
  return {
    banner: 'bg-slate-600 border-slate-700',
    iconBg: 'bg-white/20',
    icon: AlertTriangle,
    overall: status || 'Not verified',
  };
};

export const VerificationResultView = ({
  result,
  onBack,
  onSwitchToRegistrar,
  isRegistrarLoggedIn = false,
  compact = false,
}) => {
  const failureShell = (bannerClass, title, message, tips) => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <VerificationPortalHeader
        onSwitchToRegistrar={onSwitchToRegistrar}
        isRegistrarLoggedIn={isRegistrarLoggedIn}
      />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to verification
        </button>
        <div className={`rounded-2xl text-white border shadow-lg overflow-hidden mb-6 ${bannerClass}`}>
          <div className="px-5 py-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Overall status</p>
              <h2 className="text-2xl font-bold mt-0.5">{title}</h2>
              <p className="text-sm mt-2 leading-relaxed opacity-95">{message}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">What to do next</h3>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">{tips}</ul>
        </div>
      </main>
    </div>
  );

  if (!result.found) {
    return failureShell(
      'bg-red-600 border-red-700',
      'Not verified',
      result.error || 'This QR code or document could not be matched to an active record.',
      <>
        <li>Confirm the QR code on the paper TOR is intact and unaltered.</li>
        <li>Double-check the DCN, full name, and student ID you entered.</li>
        <li>Contact the Registrar&apos;s Office if the document appears suspicious.</li>
      </>
    );
  }

  if (result.revoked) {
    const dcn = result.record?.dcn;
    return failureShell(
      'bg-red-600 border-red-700',
      result.overallStatus || 'Revoked',
      result.statusMessage ||
        'This Transcript of Records has been revoked by the registrar and is no longer valid.',
      <>
        {dcn && (
          <li>
            Document control number on file: <strong className="font-mono">{dcn}</strong>
          </li>
        )}
        <li>Do not accept this TOR for employment, transfer, or any official purpose.</li>
        <li>Contact the Office of the Registrar if you need a current or replacement transcript.</li>
      </>
    );
  }

  if (result.identityMatch === false) {
    return failureShell(
      'bg-amber-600 border-amber-700',
      result.overallStatus || 'Identity mismatch',
      result.statusMessage ||
        result.error ||
        'The photo does not match the registrar record for this QR code.',
      <>
        {result.matchSummary && (
          <li>
            <strong>Scan result:</strong> {result.matchSummary}
          </li>
        )}
        <li>
          Include <strong>Date Issued</strong> in the photo (e.g. 5/21/2026), not only admission or enrollment
          dates.
        </li>
        <li>Retake in good light with name, student ID, and date issued all visible.</li>
        <li>Contact the Registrar&apos;s Office if the printed TOR does not match the QR record.</li>
      </>
    );
  }

  const record = result.record;
  if (!record) {
    return failureShell(
      'bg-red-600 border-red-700',
      'Not verified',
      result.error || 'Verification could not be completed.',
      <>
        <li>Try again with the information printed on the physical TOR.</li>
        <li>Contact the Registrar&apos;s Office for assistance.</li>
      </>
    );
  }

  const verified = result.verified ?? (record.status === 'Active' && result.identityMatch);
  const theme = statusTheme(record.status, verified, result.identityMatch);
  const StatusIcon = theme.icon;
  const maskedName = result.maskedName;
  const maskedStudentId =
    result.maskedStudentId || maskStudentId(record.studentId);
  const issuingOffice = result.issuingOffice || ISSUING_OFFICE_DEFAULT;
  const statusMessage =
    result.statusMessage ||
    (verified
      ? 'This document matches an active registrar record.'
      : `This document was found but is marked as ${record.status}.`);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <VerificationPortalHeader
        onSwitchToRegistrar={onSwitchToRegistrar}
        isRegistrarLoggedIn={isRegistrarLoggedIn}
      />

      <main className={`flex-1 w-full mx-auto px-4 py-5 ${compact ? 'max-w-lg' : 'max-w-lg'}`}>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to verification
        </button>

        {/* Status banner */}
        <div
          className={`rounded-2xl text-white border shadow-lg overflow-hidden mb-5 ${theme.banner}`}
        >
          <div className="px-5 py-5 flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}
            >
              <StatusIcon className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                Overall status
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-0.5">
                {result.overallStatus || theme.overall}
              </h2>
              <p className="text-sm opacity-95 mt-2 leading-relaxed">{statusMessage}</p>
              {record.verificationToken && (
                <span className="inline-block mt-3 text-xs font-mono font-semibold bg-black/20 px-3 py-1.5 rounded-full">
                  Token: {record.verificationToken}
                </span>
              )}
            </div>
          </div>
        </div>

        {result.manualVerification && result.matchSummary && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Manual verification
            </p>
            <p className="mt-1 text-sm text-blue-900">{result.matchSummary}</p>
            <p className="mt-2 text-xs text-blue-800/90">
              Compare each masked field below with the paper TOR in your hands before accepting the
              document.
            </p>
          </div>
        )}

        {!result.manualVerification && result.identityMatch && result.matchSummary && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">
              Photo identity scan passed
            </p>
            <p className="mt-1 text-sm text-green-900">{result.matchSummary}</p>
          </div>
        )}

        {/* Identity-masked cross-match */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Identity-masked cross-match
            </p>
          </div>
          <div className="px-4">
            <DetailRow icon={Hash} label="Document control number" value={record.dcn} mono />
            <DetailRow
              icon={CreditCard}
              label="Student ID (masked)"
              value={maskedStudentId}
              mono
            />
            <DetailRow
              icon={User}
              label="Graduate name (masked)"
              value={maskedName}
            />
            <DetailRow
              icon={Calendar}
              label="Date issued"
              value={formatDateIssued(record.dateIssued)}
            />
            <DetailRow icon={MapPin} label="Issuing office" value={issuingOffice} />
          </div>
        </div>

        {/* Verification policy */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-5 shadow-sm">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Verification policy
              </p>
              <p className="mt-2 text-sm text-amber-950/90 leading-relaxed">
                If the masked name or details above do not align perfectly with the physical paper
                document in your hands, this QR code may have been copied from a different
                student&apos;s record.{' '}
                <strong>Do not accept this document.</strong> Contact the Registrar immediately.
              </p>
            </div>
          </div>
        </div>

        {record.status === 'Revoked' && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            This TOR has been <strong>revoked</strong> and must not be used for official purposes.
          </p>
        )}

        {record.status === 'Expired' && (
          <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            This TOR is <strong>expired</strong>. Contact the Registrar for a current copy.
          </p>
        )}

        {!compact && (
          <div className="mt-8 text-center pb-6">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Verify another document
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
