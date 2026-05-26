import React, { useEffect, useState } from 'react';
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
import { verification } from '../api/client';
import { verifyOnce, clearVerifyCache } from '../services/verifyCache';
import { PhotoVerificationForm } from './PhotoVerificationForm';
import {
  savePendingVerifyPhoto,
  loadPendingVerifyPhoto,
  clearPendingVerifyPhoto,
} from '../services/photoPersist';
import { VerificationResultView } from './VerificationResultView';

const PortalHeader = ({
  compact = false,
  isRegistrarLoggedIn = false,
  onRegistrarLogin,
  onGoToRegistrarPortal,
}) => (
  <header className="relative z-20 bg-slate-900 border-b border-slate-800">
    <div
      className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 ${
        compact ? 'py-4' : 'py-5'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40 shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-white tracking-tight">CrediTOR</h1>
          <p className="text-[11px] text-slate-400 truncate">Transcript Verification Portal</p>
        </div>
      </div>
      <button
        type="button"
        onClick={isRegistrarLoggedIn ? onGoToRegistrarPortal : onRegistrarLogin}
        className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/30"
      >
        {isRegistrarLoggedIn ? 'Registrar Portal' : 'Registrar Login'}
      </button>
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Photo Scan</p>
          <p className="text-sm text-slate-700 mt-1.5 font-medium leading-snug">
            Snap TOR details — name, ID &amp; date matched
          </p>
        </div>
      </div>
    </FloatingCard>

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
          <p className="text-[11px] text-slate-500">QR + photo identity scan</p>
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
          Scan QR or enter DCN
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            2
          </span>
          Photograph TOR details (QR only)
        </li>
      </ul>
    </FloatingCard>

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

    <FloatingCard className="bottom-[12%] right-[2%] xl:right-[3%] w-64 xl:w-80 rotate-1">
      <div className="flex items-center gap-2.5 mb-4">
        <Lock className="w-5 h-5 text-slate-700 shrink-0" />
        <p className="text-sm font-bold text-slate-800">Secure checks</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['DCN', 'Token', 'Photo'].map((label) => (
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

    <FloatingIconBubble className="bottom-[28%] left-[22%] xl:left-[24%] rotate-3" size="lg">
      <QrCode className="w-7 h-7 text-blue-500" />
    </FloatingIconBubble>
    <FloatingIconBubble className="bottom-[26%] right-[24%] xl:right-[26%] -rotate-2">
      <BadgeCheck className="w-5 h-5 text-green-600" />
    </FloatingIconBubble>
  </div>
);

const mapVerificationResponse = (data) => {
  if (data.found && data.revoked) {
    return {
      found: true,
      verified: false,
      revoked: true,
      identityMatch: true,
      record: data.record,
      overallStatus: data.overallStatus || 'Revoked',
      statusMessage: data.statusMessage,
      matchSummary: data.matchSummary,
      manualVerification: data.manualVerification,
    };
  }
  if (data.found && data.identityMatch === false) {
    return {
      found: true,
      verified: false,
      identityMatch: false,
      error: data.error,
      overallStatus: data.overallStatus || 'Identity Mismatch',
      statusMessage: data.statusMessage,
      matchSummary: data.matchSummary,
    };
  }
  if (data.found && data.record && data.identityMatch) {
    return {
      found: true,
      verified: data.verified,
      record: data.record,
      maskedName: data.maskedName,
      maskedStudentId: data.maskedStudentId,
      issuingOffice: data.issuingOffice,
      overallStatus: data.overallStatus,
      statusMessage: data.statusMessage,
      identityMatch: true,
      manualVerification: data.manualVerification,
      matchSummary: data.matchSummary,
    };
  }
  return {
    found: false,
    verified: false,
    identityMatch: false,
    error: data.error || 'Verification failed',
  };
};

const buildVerifyCacheKey = (kind, id, fileName) => `${kind}:${id}:photo:${fileName || 'unknown'}`;

export const PublicVerificationPortal = ({
  verificationToken,
  onClearToken,
  onRegistrarLogin,
  onGoToRegistrarPortal,
  isRegistrarLoggedIn = false,
  backendChecking = false,
  backendReady = true,
}) => {
  const [dcnInput, setDcnInput] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [scanPhase, setScanPhase] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lastCacheKey, setLastCacheKey] = useState(null);

  const handlePhotoChange = (file, previewUrl) => {
    setPhotoFile(file);
    setPhotoPreviewUrl(previewUrl);
    if (file && verificationToken) {
      savePendingVerifyPhoto(verificationToken, file);
    } else if (!file) {
      clearPendingVerifyPhoto();
    }
  };

  useEffect(() => {
    if (!verificationToken) return;

    let cancelled = false;
    loadPendingVerifyPhoto(verificationToken).then((restored) => {
      if (cancelled || !restored) return;
      setPhotoFile(restored.file);
      setPhotoPreviewUrl(restored.previewUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [verificationToken]);

  const handleDcnLookup = async () => {
    const dcn = dcnInput.trim().toUpperCase();
    if (!dcn) {
      alert('Please enter a Document Control Number (DCN)');
      return;
    }

    setIsSearching(true);
    const cacheKey = `dcn:${dcn}:lookup`;
    setLastCacheKey(cacheKey);

    try {
      const data = await verifyOnce(cacheKey, () => verification.byDCN(dcn));
      setVerificationResult(mapVerificationResponse(data));
    } catch (err) {
      setVerificationResult({ found: false, error: err.message, identityMatch: false });
    } finally {
      setIsSearching(false);
    }
  };

  const runPhotoVerification = async () => {
    if (!backendReady) {
      alert('Still connecting to the server. Wait a moment and try again.');
      return;
    }

    if (!photoFile) {
      alert('Please take a photo of the TOR showing name, student ID, and date issued.');
      return;
    }

    setIsSearching(true);
    setScanPhase('Reading photo with OCR…');

    try {
      const cacheKey = buildVerifyCacheKey('token', verificationToken, photoFile.name);
      setLastCacheKey(cacheKey);

      const data = await verifyOnce(cacheKey, () =>
        verification.byTokenWithPhoto(verificationToken, photoFile)
      );
      setVerificationResult(mapVerificationResponse(data));
      clearPendingVerifyPhoto();
    } catch (err) {
      setVerificationResult({ found: false, error: err.message, identityMatch: false });
    } finally {
      setIsSearching(false);
      setScanPhase('');
    }
  };

  const handleBackToSearch = () => {
    setVerificationResult(null);
    setDcnInput('');
    if (photoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    if (lastCacheKey) {
      clearVerifyCache(lastCacheKey);
      setLastCacheKey(null);
    }
    clearPendingVerifyPhoto();
    if (verificationToken) {
      onClearToken?.();
    }
  };

  if (verificationResult) {
    return (
      <VerificationResultView
        result={verificationResult}
        onBack={handleBackToSearch}
        onSwitchToRegistrar={
          isRegistrarLoggedIn ? onGoToRegistrarPortal : onRegistrarLogin
        }
        isRegistrarLoggedIn={isRegistrarLoggedIn}
        compact={Boolean(verificationToken)}
      />
    );
  }

  const isQrFlow = Boolean(verificationToken);

  if (isQrFlow) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PortalHeader
          compact
          isRegistrarLoggedIn={isRegistrarLoggedIn}
          onRegistrarLogin={onRegistrarLogin}
          onGoToRegistrarPortal={onGoToRegistrarPortal}
        />
        <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full">
          {backendChecking && (
            <p className="mb-4 text-center text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              Connecting to server… you can still take a photo while waiting.
            </p>
          )}
          <h2 className="text-2xl font-bold text-slate-900 text-center">Verify this TOR</h2>
          <p className="mt-2 text-sm text-slate-600 text-center">
            Photograph the name, student ID, and date issued on the paper document, then tap{' '}
            <strong>Scan &amp; verify</strong>.
          </p>
          <div className="mt-6">
            <PhotoVerificationForm
              dcn={dcnInput}
              onDcnChange={setDcnInput}
              photoFile={photoFile}
              photoPreviewUrl={photoPreviewUrl}
              onPhotoChange={handlePhotoChange}
              onSubmit={runPhotoVerification}
              isSubmitting={isSearching}
              scanPhase={scanPhase}
              showDcn={false}
              showQrHint
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-dot-grid">
      <PortalHeader
        isRegistrarLoggedIn={isRegistrarLoggedIn}
        onRegistrarLogin={onRegistrarLogin}
        onGoToRegistrarPortal={onGoToRegistrarPortal}
      />

      <main className="relative w-full min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)]">
        <HeroDecorations />

        <section className="relative z-10 flex flex-col items-center justify-center px-4 py-14 sm:py-20 min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white shadow-[0_16px_48px_rgba(15,23,42,0.1)] border border-slate-200">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 text-center tracking-tight">
            Verify your document
          </h2>
          <p className="mt-1 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-400 text-center tracking-tight">
            all in one place
          </p>
          <p className="mt-4 max-w-md text-center text-sm sm:text-base text-slate-600">
            Enter the Document Control Number (DCN) from the TOR. We show registrar-backed details —
            you manually compare them with the physical document.
          </p>

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
                onKeyDown={(e) => e.key === 'Enter' && handleDcnLookup()}
                placeholder="e.g., DCN-12345"
                className="flex-1 min-w-0 px-5 py-3.5 sm:py-4 text-lg font-mono text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleDcnLookup}
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
            <p className="mt-2 text-center text-xs text-slate-500">
              Scan the QR code on the TOR for automatic photo verification instead.
            </p>
          </div>

          <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-700" />
            Manual cross-check · Registrar-backed records
          </p>
        </section>
      </main>

      <PortalBottomSection />
    </div>
  );
};

export { VerificationResultView as VerificationResult };
