import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Shield,
  QrCode,
  FileCheck,
  Lock,
  CheckCircle2,
  Clock,
  BadgeCheck,
  ScanLine,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { maskName } from '../services/mockData';

const PortalHeader = ({ compact = false }) => (
  <header className="relative z-20 bg-slate-900 border-b border-slate-800">
    <div
      className={`max-w-6xl mx-auto px-6 flex items-center justify-between ${
        compact ? 'py-4' : 'py-5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">CrediTOR</h1>
          <p className="text-[11px] text-slate-400">Document Verification Portal</p>
        </div>
      </div>
      <p className="hidden sm:block text-xs text-slate-400 font-medium">
        Secure Verification System
      </p>
    </div>
  </header>
);

const PORTAL_STATS = [
  { value: '< 30', suffix: 's', label: 'Avg. verification time' },
  { value: '100', suffix: '%', label: 'Registrar-backed checks' },
  { value: '24', suffix: '/7', label: 'Public portal availability' },
];

const PortalBottomSection = () => (
  <footer className="relative z-10 shrink-0 bg-white border-t border-slate-200">
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-14 sm:pt-14 sm:pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 sm:divide-x sm:divide-slate-200">
        {PORTAL_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`text-center ${i > 0 ? 'sm:px-10' : 'sm:pr-10'} ${i < PORTAL_STATS.length - 1 ? 'sm:pl-0' : 'sm:pl-10'}`}
          >
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {stat.value}
              <span className="text-2xl sm:text-3xl font-bold text-slate-400">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 sm:mt-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug">
          <span className="text-blue-600 inline-flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
            Most transcript fraud
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 align-middle">
              <Shield className="w-5 h-5 text-blue-600" strokeWidth={2.25} />
            </span>
          </span>
          <br />
          <span className="text-slate-900">isn&apos;t random — it&apos;s preventable</span>
        </h2>
        <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-[15px] text-slate-500 leading-relaxed">
          Right now, employers and institutions accept forged Transcripts of Records because they
          can&apos;t confirm them against the registrar. Not because they&apos;re careless — because they
          lack instant access to{' '}
          <span className="font-semibold text-violet-500">official verification</span> at the moment
          they need it.
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Questions about verification? Contact the Registrar&apos;s Office.
        </p>
      </div>
    </div>
  </footer>
);

const FloatingCard = ({ className, children }) => (
  <div
    className={`absolute hidden md:block bg-white rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.1)] border border-slate-200/80 p-5 xl:p-6 ${className}`}
  >
    {children}
  </div>
);

const FloatingIconBubble = ({ className, children, size = 'md' }) => (
  <div
    className={`absolute hidden md:flex items-center justify-center bg-white rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-200 ${
      size === 'lg' ? 'w-14 h-14 xl:w-16 xl:h-16' : 'w-11 h-11 xl:w-12 xl:h-12'
    } ${className}`}
  >
    {children}
  </div>
);

const ProgressRow = ({ label, percent, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="text-slate-600 font-medium truncate pr-2">{label}</span>
      <span className="text-slate-400 shrink-0">{percent}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const HeroDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block max-w-[1600px] mx-auto left-0 right-0">
    {/* Top left — sticky note + QR scan */}
    <div className="absolute top-[6%] left-[2%] xl:left-[4%] w-44 xl:w-52 -rotate-6 rounded-xl bg-amber-50 border border-amber-200/90 shadow-[0_12px_32px_rgba(180,130,0,0.12)] p-4 xl:p-5">
      <span className="absolute -top-2 left-4 text-lg" aria-hidden>
        📌
      </span>
      <p className="text-sm xl:text-[15px] text-amber-950/80 font-medium leading-relaxed mt-1">
        Find your DCN on the official TOR — usually near the QR code.
      </p>
    </div>

    <FloatingIconBubble className="top-[22%] left-[14%] xl:left-[16%] -rotate-3" size="lg">
      <BadgeCheck className="w-7 h-7 xl:w-8 xl:h-8 text-blue-600" />
    </FloatingIconBubble>

    <FloatingCard className="top-[28%] left-[2%] xl:left-[3%] w-56 xl:w-64 -rotate-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
          <ScanLine className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">QR Scan</p>
          <p className="text-sm text-slate-700 mt-1.5 font-medium leading-snug">
            Point your camera at the TOR QR code
          </p>
        </div>
      </div>
    </FloatingCard>

    {/* Top right — instant verify + reminder */}
    <FloatingCard className="top-[5%] right-[2%] xl:right-[4%] w-64 xl:w-72 rotate-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-slate-800">Instant verify</p>
        <QrCode className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">TOR lookup</p>
          <p className="text-[11px] text-slate-500">Opens this portal automatically</p>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0">
          Live
        </span>
      </div>
    </FloatingCard>

    <FloatingIconBubble className="top-[20%] right-[18%] xl:right-[20%] rotate-6">
      <Clock className="w-5 h-5 xl:w-6 xl:h-6 text-slate-700" />
    </FloatingIconBubble>

    <FloatingCard className="top-[32%] right-[2%] xl:right-[3%] w-56 xl:w-64 -rotate-1">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Verification steps</p>
      <ul className="space-y-2 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center">
            1
          </span>
          Scan or enter DCN
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            2
          </span>
          Match registrar record
        </li>
      </ul>
    </FloatingCard>

    {/* Mid sides — icon bubbles */}
    <FloatingIconBubble className="top-[44%] left-[8%] xl:left-[10%]">
      <FileCheck className="w-5 h-5 xl:w-6 xl:h-6 text-blue-600" />
    </FloatingIconBubble>
    <FloatingIconBubble className="top-[40%] right-[10%] xl:right-[12%]" size="lg">
      <Shield className="w-7 h-7 xl:w-8 xl:h-8 text-slate-800" />
    </FloatingIconBubble>
    <FloatingIconBubble className="top-[52%] left-[18%] xl:left-[20%] -rotate-6">
      <GraduationCap className="w-5 h-5 text-violet-600" />
    </FloatingIconBubble>
    <FloatingIconBubble className="top-[48%] right-[22%] xl:right-[24%] rotate-3">
      <Lock className="w-5 h-5 text-slate-600" />
    </FloatingIconBubble>

    {/* Bottom left — document status with task bars */}
    <FloatingCard className="bottom-[14%] left-[2%] xl:left-[3%] w-64 xl:w-80 -rotate-2">
      <p className="text-sm font-bold text-slate-800 mb-4">Document status</p>
      <div className="space-y-3">
        <ProgressRow label="Active records" percent={88} color="bg-blue-600" />
        <ProgressRow label="Revoked flagged" percent={12} color="bg-orange-400" />
        <ProgressRow label="Expired archive" percent={24} color="bg-slate-400" />
      </div>
      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Active · Revoked · Expired
      </p>
    </FloatingCard>

    {/* Bottom right — secure checks */}
    <FloatingCard className="bottom-[12%] right-[2%] xl:right-[3%] w-64 xl:w-80 rotate-1">
      <div className="flex items-center gap-2.5 mb-4">
        <Lock className="w-5 h-5 text-slate-700 shrink-0" />
        <p className="text-sm font-bold text-slate-800">Secure checks</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['DCN', 'Token', 'Hash'].map((label) => (
          <span
            key={label}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        Trusted by registrars
      </p>
      <div className="flex items-center gap-3">
        {[
          { bg: 'bg-red-50', icon: '🏛️', label: 'Registrar' },
          { bg: 'bg-blue-50', icon: '📋', label: 'Records' },
          { bg: 'bg-green-50', icon: '✓', label: 'Official' },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl ${item.bg} border border-slate-100`}
          >
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </FloatingCard>

    {/* Bottom edge accents */}
    <FloatingIconBubble className="bottom-[28%] left-[22%] xl:left-[24%] rotate-3" size="lg">
      <QrCode className="w-7 h-7 text-blue-500" />
    </FloatingIconBubble>
    <FloatingIconBubble className="bottom-[26%] right-[24%] xl:right-[26%] -rotate-2">
      <BadgeCheck className="w-5 h-5 text-green-600" />
    </FloatingIconBubble>
  </div>
);

export const PublicVerificationPortal = ({ torRecords, onVerification, verificationToken }) => {
  const [dcnInput, setDcnInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (verificationToken) {
      const record = torRecords.find((r) => r.verificationToken === verificationToken);
      if (record) {
        setVerificationResult({
          found: true,
          record,
          maskedName: maskName(record.fullName),
        });
      } else {
        setVerificationResult({
          found: false,
          error: 'Invalid verification token',
        });
      }
    }
  }, [verificationToken, torRecords]);

  const handleSearch = () => {
    if (!dcnInput.trim()) {
      alert('Please enter a Document Control Number (DCN)');
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const record = torRecords.find((r) => r.dcn.toUpperCase() === dcnInput.toUpperCase());

      if (record) {
        setVerificationResult({
          found: true,
          record,
          maskedName: maskName(record.fullName),
        });
      } else {
        setVerificationResult({
          found: false,
          error: `No document found with DCN: ${dcnInput}`,
        });
      }

      setIsSearching(false);
    }, 500);
  };

  const handleBackToSearch = () => {
    setVerificationResult(null);
    setDcnInput('');
  };

  if (verificationResult) {
    return <VerificationResult result={verificationResult} onBack={handleBackToSearch} />;
  }

  return (
    <div className="flex flex-col bg-dot-grid">
      <PortalHeader />

      <main className="relative w-full min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)]">
        <HeroDecorations />

        <section className="relative z-10 flex flex-col items-center justify-center px-4 py-14 sm:py-20 min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] max-w-3xl mx-auto">
          {/* Hero icon */}
          <div className="mb-6 flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white shadow-[0_16px_48px_rgba(15,23,42,0.1)] border border-slate-200">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" strokeWidth={2} />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 text-center tracking-tight">
            Verify your document
          </h2>
          <p className="mt-1 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-400 text-center tracking-tight">
            all in one place
          </p>
          <p className="mt-4 max-w-md text-center text-sm sm:text-base text-slate-600">
            Scan the QR code on your Transcript of Records, or enter your Document Control Number
            below.
          </p>

          {/* Centered DCN search */}
          <div className="mt-8 w-full max-w-lg">
            <label htmlFor="dcn-input" className="sr-only">
              Document Control Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.1)] border border-slate-200">
              <input
                id="dcn-input"
                type="text"
                value={dcnInput}
                onChange={(e) => setDcnInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., DCN-12345"
                className="flex-1 min-w-0 px-5 py-3.5 sm:py-4 text-lg font-mono text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
              >
                {isSearching ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verify Document
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              DCN is printed on your official TOR — typically starts with{' '}
              <span className="font-mono font-semibold text-slate-700">DCN-</span>
            </p>
          </div>

          <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-700" />
            Secure verification protocols · Registrar-backed records
          </p>
        </section>
      </main>

      <PortalBottomSection />
    </div>
  );
};

const ResultPageShell = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-dot-grid">
    <PortalHeader compact />
    <main className="flex-1 flex items-center justify-center px-4 py-10">{children}</main>
    <PortalBottomSection />
  </div>
);

const VerificationResult = ({ result, onBack }) => {
  if (result.error && !result.found) {
    return (
      <ResultPageShell>
        <div className="w-full max-w-2xl">
          <div className="bg-red-600 text-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-red-700">
            <div className="px-8 py-6 flex items-center gap-4">
              <AlertTriangle className="w-12 h-12 shrink-0" />
              <div>
                <h2 className="text-2xl font-bold">Invalid Document</h2>
                <p className="text-red-100 mt-1">{result.error}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">What to do next:</h3>
            <ul className="space-y-3 text-slate-700 text-sm">
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Double-check the Document Control Number (DCN) you entered</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Ensure the QR code on your document is not damaged or altered</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Contact the Registrar&apos;s Office if the document appears invalid</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold transition shadow-lg"
            >
              Try Another Search
            </button>
          </div>
        </div>
      </ResultPageShell>
    );
  }

  const record = result.record;
  const maskedName = result.maskedName;

  const statusStyles =
    record.status === 'Active'
      ? 'bg-green-600 border-green-700'
      : record.status === 'Revoked'
        ? 'bg-red-600 border-red-700'
        : record.status === 'Expired'
          ? 'bg-slate-600 border-slate-700'
          : 'bg-slate-600 border-slate-700';

  return (
    <ResultPageShell>
      <div className="w-full max-w-2xl">
        <div className={`rounded-2xl shadow-xl overflow-hidden mb-6 text-white border ${statusStyles}`}>
          <div className="px-8 py-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {record.status === 'Active' && '✓ VERIFIED'}
              {record.status === 'Revoked' && '✗ REVOKED'}
              {record.status === 'Expired' && '⚠ EXPIRED'}
            </h2>
            <p className="text-sm opacity-90">Document Status: {record.status}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
            Document Verification Details
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="font-semibold text-slate-700 text-sm">Document Control Number (DCN)</span>
              <span className="text-xl font-mono font-bold text-blue-600">{record.dcn}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 text-sm">Date Issued</span>
              <span className="text-lg font-semibold text-slate-900">
                {new Date(record.dateIssued).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 text-sm">Graduate Name (Masked)</span>
              <span className="text-lg font-mono text-slate-900">{maskedName}</span>
            </div>
          </div>

          <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-400 mb-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-yellow-900 mb-2">Verification Policy</h4>
                <p className="text-sm text-yellow-800">
                  <strong>CRITICAL:</strong> If the masked name or details above do not align perfectly with
                  the physical paper document in your hands, this QR code may have been copied from a
                  different student&apos;s record. <strong>Do not accept this document.</strong> Contact the
                  Registrar immediately.
                </p>
              </div>
            </div>
          </div>

          {record.status === 'Revoked' && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
              <p className="text-sm text-red-800">
                <strong>This document has been revoked</strong> and is no longer valid for official purposes.
              </p>
            </div>
          )}

          {record.status === 'Expired' && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
              <p className="text-sm text-gray-800">
                <strong>This document has expired</strong> and may need to be renewed. Contact the
                Registrar&apos;s Office for more information.
              </p>
            </div>
          )}

          {record.status === 'Active' && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-6">
              <p className="text-sm text-green-800">
                <strong>This document is valid and active.</strong> The information above matches our records.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <h4 className="font-semibold text-slate-900 mb-3">About This Verification</h4>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>All details have been cross-referenced with our system</li>
            <li>This verification is valid for official document recognition</li>
            <li>This portal does not store or log your personal information</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold transition shadow-lg"
          >
            Verify Another Document
          </button>
        </div>
      </div>
    </ResultPageShell>
  );
};

export { VerificationResult };
