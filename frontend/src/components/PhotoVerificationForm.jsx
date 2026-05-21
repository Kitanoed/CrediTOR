import React, { useEffect, useRef, useState } from 'react';
import { Camera, Hash, ScanLine, Search, Upload } from 'lucide-react';

export const PhotoVerificationForm = ({
  dcn,
  onDcnChange,
  photoFile,
  photoPreviewUrl,
  onPhotoChange,
  onSubmit,
  isSubmitting,
  scanPhase = '',
  showDcn = true,
  showQrHint = false,
}) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const submitLockRef = useRef(false);
  const [previewUrl, setPreviewUrl] = useState(photoPreviewUrl || null);

  useEffect(() => {
    setPreviewUrl(photoPreviewUrl || null);
  }, [photoPreviewUrl]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please take or choose a photo (JPG, PNG, etc.)');
      return;
    }
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoChange(file, url);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitLockRef.current || isSubmitting || !photoFile) return;
    submitLockRef.current = true;
    Promise.resolve(onSubmit()).finally(() => {
      submitLockRef.current = false;
    });
  };

  const clearPhoto = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoChange(null, null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-lg space-y-4">
      {showQrHint && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold flex items-center gap-2">
            <ScanLine className="w-4 h-4" />
            QR code linked
          </p>
          <p className="mt-1 text-blue-800/90">
            Take a clear photo that includes <strong>Full Name</strong>, <strong>Student ID</strong>, and the{' '}
            <strong>Date Issued</strong> printed on the TOR (same date the registrar entered — not admission
            date). Then tap <strong>Scan &amp; verify</strong>{' '}
            (your photo is saved if the page reloads after the camera).
          </p>
        </div>
      )}

      <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.1)] border border-slate-200 space-y-4">
        {showDcn && (
          <div>
            <label
              htmlFor="verify-dcn"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
            >
              <Hash className="w-3.5 h-3.5" />
              Document control number (DCN)
            </label>
            <input
              id="verify-dcn"
              type="text"
              value={dcn}
              onChange={(e) => onDcnChange(e.target.value.toUpperCase())}
              placeholder="e.g., DCN-12345"
              className="w-full px-4 py-3 text-lg font-mono text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            Photo of TOR details
          </p>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="TOR details preview"
                className="w-full max-h-56 object-contain rounded-xl border border-slate-200 bg-slate-50"
              />
              <p className="text-xs text-green-700 font-medium text-center">
                Photo ready — tap Scan &amp; verify below
              </p>
              <button
                type="button"
                onClick={clearPhoto}
                disabled={isSubmitting}
                className="text-xs text-blue-600 font-semibold hover:underline block mx-auto"
              >
                Retake photo
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 space-y-3">
              <Camera className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-800 text-sm">Capture name, ID &amp; date issued</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4" />
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100"
                >
                  <Upload className="w-4 h-4" />
                  From gallery
                </button>
              </div>
            </div>
          )}
        </div>

        {isSubmitting && scanPhase && (
          <p className="text-xs text-slate-500 text-center">{scanPhase}</p>
        )}

        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={isSubmitting || !photoFile}
          className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {scanPhase || 'Verifying…'}
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan &amp; verify
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 px-2">
        Your photo is read on the server with OCR.space and matched to the registrar record. After taking a photo, tap Scan
        &amp; verify — do not refresh the page.
      </p>
    </div>
  );
};
