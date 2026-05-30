import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

const PAGE_SIZE = 10;

const STAT_FILTERS = {
  all: {
    title: 'All Events',
    subtitle: 'Every event in the audit trail',
    filter: () => true,
    countColor: 'text-slate-900',
  },
  created: {
    title: 'Created Records',
    subtitle: 'TOR registration events',
    filter: (log) => log.eventType === 'Record Creation',
    countColor: 'text-blue-600',
  },
  verified: {
    title: 'Verified',
    subtitle: 'Successful verification attempts',
    filter: (log) => log.eventType === 'Verification Success',
    countColor: 'text-green-600',
  },
  failed: {
    title: 'Failed',
    subtitle: 'Failed verification attempts',
    filter: (log) => log.eventType === 'Verification Failure',
    countColor: 'text-red-600',
  },
};

const getEventIcon = (eventType, size = 'sm') => {
  const className = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  switch (eventType) {
    case 'Record Creation':
      return <CheckCircle className={`${className} text-blue-600 shrink-0`} />;
    case 'Status Update':
      return <Clock className={`${className} text-orange-600 shrink-0`} />;
    case 'Verification Success':
      return <CheckCircle className={`${className} text-green-600 shrink-0`} />;
    case 'Verification Failure':
      return <AlertCircle className={`${className} text-red-600 shrink-0`} />;
    default:
      return <Clock className={`${className} text-slate-600 shrink-0`} />;
  }
};

const getEventBgColor = (eventType) => {
  switch (eventType) {
    case 'Record Creation':
      return 'bg-blue-50 border-blue-200';
    case 'Status Update':
      return 'bg-orange-50 border-orange-200';
    case 'Verification Success':
      return 'bg-green-50 border-green-200';
    case 'Verification Failure':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

const getEventTextColor = (eventType) => {
  switch (eventType) {
    case 'Record Creation':
      return 'text-blue-800';
    case 'Status Update':
      return 'text-orange-800';
    case 'Verification Success':
      return 'text-green-800';
    case 'Verification Failure':
      return 'text-red-800';
    default:
      return 'text-slate-800';
  }
};

const DESCRIPTION_PREVIEW_LEN = 72;

const AuditLogEntry = ({ log }) => (
  <div
    className={`border-l-4 border-slate-300 pl-4 py-3 rounded-r-lg ${getEventBgColor(log.eventType)}`}
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{getEventIcon(log.eventType, 'lg')}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className={`font-semibold text-sm ${getEventTextColor(log.eventType)}`}>{log.eventType}</h3>
          <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
        </div>
        <p className="text-slate-700 text-sm mb-1">{log.details}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span>
            <strong>DCN:</strong> {log.dcn || '—'}
          </span>
          <span>
            <strong>Actor:</strong> {log.registrarId || '—'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const AuditEventsModal = ({ filterKey, logs, onClose }) => {
  const config = STAT_FILTERS[filterKey];
  const filtered = useMemo(
    () => logs.filter(STAT_FILTERS[filterKey].filter),
    [logs, filterKey]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-events-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h2 id="audit-events-modal-title" className="text-xl font-bold text-slate-900">
              {config.title}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{config.subtitle}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {filtered.length} event{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No events in this category yet.</p>
          ) : (
            filtered.map((log) => <AuditLogEntry key={log.id} log={log} />)
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DescriptionModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-description-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b border-slate-100">
          <div>
            <h2 id="audit-description-title" className="text-lg font-bold text-slate-900">
              Event description
            </h2>
            <p className={`text-sm font-semibold mt-1 ${getEventTextColor(log.eventType)}`}>
              {log.eventType}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
            {log.details || '—'}
          </p>
          <dl className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-600 shrink-0">DCN:</dt>
              <dd className="font-mono text-blue-600">{log.dcn || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-600 shrink-0">Actor:</dt>
              <dd className="text-slate-800">{log.registrarId || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TablePagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{start}</span>–
        <span className="font-semibold text-slate-900">{end}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> events
      </p>
      <nav className="flex items-center gap-1" aria-label="Audit log pagination">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-[2.25rem] px-3 py-1.5 text-sm font-semibold rounded-lg border transition ${
              page === currentPage
                ? 'bg-slate-800 text-white border-slate-800'
                : 'text-slate-700 border-slate-300 hover:bg-white'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

const StatCard = ({ label, count, countColor, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-white rounded-lg p-6 border border-slate-200 shadow text-left w-full hover:border-blue-400 hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
  >
    <p className="text-slate-600 text-sm font-semibold mb-2">{label}</p>
    <p className={`text-3xl font-bold ${countColor}`}>{count}</p>
    <p className="text-xs text-slate-400 mt-2">Click to view details</p>
  </button>
);

export const AuditTrailLogs = ({ logs }) => {
  const [modalFilter, setModalFilter] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [logs]
  );

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedLogs.slice(start, start + PAGE_SIZE);
  }, [sortedLogs, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [logs.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const counts = useMemo(
    () => ({
      all: logs.length,
      created: logs.filter((l) => l.eventType === 'Record Creation').length,
      verified: logs.filter((l) => l.eventType === 'Verification Success').length,
      failed: logs.filter((l) => l.eventType === 'Verification Failure').length,
    }),
    [logs]
  );

  const previewDescription = (details) => {
    if (!details) return '—';
    if (details.length <= DESCRIPTION_PREVIEW_LEN) return details;
    return `${details.slice(0, DESCRIPTION_PREVIEW_LEN)}…`;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      {modalFilter && (
        <AuditEventsModal
          filterKey={modalFilter}
          logs={logs}
          onClose={() => setModalFilter(null)}
        />
      )}
      {selectedLog && <DescriptionModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Trail Logs</h1>
          <p className="text-slate-600">System operations and security events log</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Events"
            count={counts.all}
            countColor="text-slate-900"
            onClick={() => setModalFilter('all')}
          />
          <StatCard
            label="Created Records"
            count={counts.created}
            countColor="text-blue-600"
            onClick={() => setModalFilter('created')}
          />
          <StatCard
            label="Verified"
            count={counts.verified}
            countColor="text-green-600"
            onClick={() => setModalFilter('verified')}
          />
          <StatCard
            label="Failed"
            count={counts.failed}
            countColor="text-red-600"
            onClick={() => setModalFilter('failed')}
          />
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No audit logs yet.</p>
            <p className="text-slate-500">Audit events will appear here as system operations occur.</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Detailed Log Table</h2>
              <p className="text-sm text-slate-500">
                {sortedLogs.length} event{sortedLogs.length === 1 ? '' : 's'} · Page {safePage} of{' '}
                {totalPages}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Event Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">DCN</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedLogs.map((log) => {
                      const hasLongDescription =
                        log.details && log.details.length > DESCRIPTION_PREVIEW_LEN;

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-2 ${getEventTextColor(log.eventType)}`}
                            >
                              {getEventIcon(log.eventType)}
                              <span className="font-semibold">{log.eventType}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                            {log.dcn || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 max-w-md">
                            {log.details ? (
                              <button
                                type="button"
                                onClick={() => setSelectedLog(log)}
                                className="text-left w-full group"
                                title="Click to read full description"
                              >
                                <span className="group-hover:text-blue-700 group-hover:underline">
                                  {previewDescription(log.details)}
                                </span>
                                {hasLongDescription && (
                                  <span className="block text-xs font-semibold text-blue-600 mt-1 group-hover:underline">
                                    Read full description
                                  </span>
                                )}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                            {log.registrarId || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={sortedLogs.length}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
