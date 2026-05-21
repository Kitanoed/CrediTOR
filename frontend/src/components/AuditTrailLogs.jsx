import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const AuditTrailLogs = ({ logs }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'Record Creation':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'Status Update':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'Verification Success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Verification Failure':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
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

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Trail Logs</h1>
          <p className="text-slate-600">System operations and security events log</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Total Events</p>
            <p className="text-3xl font-bold text-slate-900">{logs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Created Records</p>
            <p className="text-3xl font-bold text-blue-600">
              {logs.filter(l => l.eventType === 'Record Creation').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Verified</p>
            <p className="text-3xl font-bold text-green-600">
              {logs.filter(l => l.eventType === 'Verification Success').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Failed</p>
            <p className="text-3xl font-bold text-red-600">
              {logs.filter(l => l.eventType === 'Verification Failure').length}
            </p>
          </div>
        </div>

        {/* Timeline View */}
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg">No audit logs yet.</p>
              <p className="text-slate-500">Audit events will appear here as system operations occur.</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id}
                className={`border-l-4 border-slate-300 pl-6 py-4 rounded-r-lg bg-white shadow-sm transition hover:shadow-md ${getEventBgColor(
                  log.eventType
                )}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1 flex-shrink-0">{getEventIcon(log.eventType)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${getEventTextColor(log.eventType)}`}>
                        {log.eventType}
                      </h3>
                      <span className="text-xs text-slate-500 ml-4">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm mb-2">{log.details}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-slate-600">
                        <strong>DCN:</strong> {log.dcn}
                      </span>
                      <span className="text-slate-600">
                        <strong>Actor:</strong> {log.registrarId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table View Alternative */}
        {logs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Detailed Log Table</h2>
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Event Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">DCN</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-2 ${getEventTextColor(log.eventType)}`}>
                            {getEventIcon(log.eventType)}
                            <span className="font-semibold">{log.eventType}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                          {log.dcn}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{log.registrarId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
