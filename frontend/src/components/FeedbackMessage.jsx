const tones = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export const FeedbackMessage = ({ tone = 'info', title, children, id }) => (
  <div
    id={id}
    role={tone === 'error' ? 'alert' : 'status'}
    className={`rounded-xl border px-4 py-3 text-sm ${tones[tone] || tones.info}`}
  >
    {title && <p className="font-semibold">{title}</p>}
    {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
  </div>
);
