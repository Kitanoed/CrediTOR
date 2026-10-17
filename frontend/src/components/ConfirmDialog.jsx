import { useEffect, useId, useRef } from 'react';

export const ConfirmDialog = ({ title, children, confirmLabel, busy, onConfirm, onCancel }) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-900/50"
    >
      <h2 id={titleId} className="text-xl font-bold text-slate-900">{title}</h2>
      <div id={descriptionId} className="mt-3 space-y-3 text-sm text-slate-600">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button autoFocus type="button" disabled={busy} onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Cancel
        </button>
        <button type="button" disabled={busy} onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          {busy ? 'Revoking TOR…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
