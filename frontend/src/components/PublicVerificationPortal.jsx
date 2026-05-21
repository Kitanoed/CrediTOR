import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Shield } from 'lucide-react';
import { maskName } from '../services/mockData';

export const PublicVerificationPortal = ({ torRecords, onVerification, verificationToken }) => {
  const [dcnInput, setDcnInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Check if we have a verification token from URL params
  useEffect(() => {
    if (verificationToken) {
      // Attempt auto-verification if token is provided
      const record = torRecords.find(r => r.verificationToken === verificationToken);
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

    // Simulate search delay
    setTimeout(() => {
      const record = torRecords.find(r => r.dcn.toUpperCase() === dcnInput.toUpperCase());

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-black bg-opacity-50 border-b border-blue-500 border-opacity-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">CrediTOR</h1>
              <p className="text-xs text-blue-200">Document Verification Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-300 text-sm">Secure Verification System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Verify Your Document</h2>
            <p className="text-xl text-blue-100 mb-2">
              Scan the QR code on your Transcript of Records with your mobile device
            </p>
            <p className="text-sm text-slate-300">
              Or use the search field below as a manual fallback
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-blue-200">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Manual Search
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Enter the Alphanumeric Document Control Number
              </p>
            </div>

            {/* Card Body */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Document Control Number (DCN)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={dcnInput}
                    onChange={(e) => setDcnInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g., DCN-12345"
                    className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-mono"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <span className="inline-block animate-spin">⏳</span>
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
              </div>

              {/* Info Text */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> The DCN can be found on your official Transcript of Records document.
                  It typically begins with "DCN-" followed by numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-300 text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              This portal uses secure verification protocols
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-black bg-opacity-50">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm">
          <p>© 2024 CrediTOR Verification System. All rights reserved.</p>
          <p className="mt-2 text-xs text-slate-500">
            For questions about document verification, please contact the Registrar's Office.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Verification Result Component
const VerificationResult = ({ result, onBack }) => {
  if (result.error && !result.found) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col">
        {/* Header */}
        <header className="bg-black bg-opacity-50 border-b border-blue-500 border-opacity-30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">CrediTOR</h1>
              <p className="text-xs text-blue-200">Document Verification Portal</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            {/* Invalid Status Banner */}
            <div className="bg-red-500 text-white rounded-lg shadow-2xl overflow-hidden mb-8">
              <div className="px-8 py-6 flex items-center gap-4">
                <AlertTriangle className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold">Invalid Document</h2>
                  <p className="text-red-100 mt-1">{result.error}</p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What to do next:</h3>
              <ul className="space-y-3 text-slate-700">
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
                  <span>Contact the Registrar's Office if the document appears invalid</span>
                </li>
              </ul>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <button
                onClick={onBack}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Try Another Search
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const record = result.record;
  const maskedName = result.maskedName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-black bg-opacity-50 border-b border-blue-500 border-opacity-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">CrediTOR</h1>
            <p className="text-xs text-blue-200">Document Verification Portal</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Status Banner */}
          <div
            className={`rounded-lg shadow-2xl overflow-hidden mb-8 ${
              record.status === 'Active'
                ? 'bg-green-500'
                : record.status === 'Revoked'
                ? 'bg-red-500'
                : record.status === 'Expired'
                ? 'bg-gray-500'
                : 'bg-slate-600'
            } text-white`}
          >
            <div className="px-8 py-8 text-center">
              <h2 className="text-4xl font-bold mb-2">
                {record.status === 'Active' && '✓ VERIFIED'}
                {record.status === 'Revoked' && '✗ REVOKED'}
                {record.status === 'Expired' && '⚠ EXPIRED'}
              </h2>
              <p className="text-sm opacity-90">Document Status: {record.status}</p>
            </div>
          </div>

          {/* Verification Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
              Document Verification Details
            </h3>

            <div className="space-y-4 mb-8">
              {/* Document Control Number */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-semibold text-slate-700">Document Control Number (DCN)</span>
                <span className="text-xl font-mono font-bold text-blue-600">{record.dcn}</span>
              </div>

              {/* Date Issued */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Date Issued</span>
                <span className="text-lg font-semibold text-slate-900">
                  {new Date(record.dateIssued).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Masked Name */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Graduate Name (Masked)</span>
                <span className="text-lg font-mono text-slate-900">{maskedName}</span>
              </div>
            </div>

            {/* Security Warning Banner */}
            <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-400 mb-6">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">⚠️ Verification Policy</h4>
                  <p className="text-sm text-yellow-800">
                    <strong>CRITICAL:</strong> If the masked name or details above do not align perfectly with
                    the physical paper document in your hands, this QR code has been fraudulently copied from a
                    different student's record. <strong>Do not accept this document.</strong> Contact the Registrar
                    immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Specific Messages */}
            {record.status === 'Revoked' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                <p className="text-sm text-red-800">
                  <strong>⚠️ This document has been revoked</strong> and is no longer valid for official purposes.
                </p>
              </div>
            )}

            {record.status === 'Expired' && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                <p className="text-sm text-gray-800">
                  <strong>⚠️ This document has expired</strong> and may need to be renewed. Contact the Registrar's
                  Office for more information.
                </p>
              </div>
            )}

            {record.status === 'Active' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
                <p className="text-sm text-green-800">
                  <strong>✓ This document is valid and active.</strong> The information above matches our records.
                </p>
              </div>
            )}
          </div>

          {/* Additional Info Card */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-8">
            <h4 className="font-semibold text-slate-900 mb-3">About This Verification</h4>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>✓ All details have been cross-referenced with our system</li>
              <li>✓ This verification is valid for official document recognition</li>
              <li>✓ This portal does not store or log your personal information</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-black bg-opacity-50">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm">
          <p>© 2024 CrediTOR Verification System. All rights reserved.</p>
          <p className="mt-2 text-xs text-slate-500">
            For questions about document verification, contact the Registrar's Office.
          </p>
        </div>
      </footer>
    </div>
  );
};

export { VerificationResult };
