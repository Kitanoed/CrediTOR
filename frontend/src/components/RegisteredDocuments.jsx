import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { getStatusColor } from '../services/mockData';

export const RegisteredDocuments = ({ records, onStatusChange }) => {
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');

  const handleEditStatus = (id, currentStatus) => {
    setEditingId(id);
    setEditingStatus(currentStatus);
  };

  const handleSaveStatus = (id) => {
    onStatusChange(id, editingStatus);
    setEditingId(null);
    setEditingStatus('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingStatus('');
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registered Documents</h1>
          <p className="text-slate-600">View and manage all registered Transcript of Records</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-slate-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Active</p>
            <p className="text-3xl font-bold text-green-600">{records.filter(r => r.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Expired</p>
            <p className="text-3xl font-bold text-gray-600">{records.filter(r => r.status === 'Expired').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow">
            <p className="text-slate-600 text-sm font-semibold mb-2">Revoked</p>
            <p className="text-3xl font-bold text-red-600">{records.filter(r => r.status === 'Revoked').length}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">DCN</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Issued</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">File</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.studentId}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{record.fullName}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">{record.dcn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(record.dateIssued).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-block max-w-xs truncate" title={record.uploadedFileName}>
                        {record.uploadedFileName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="Revoked">Revoked</option>
                            <option value="Expired">Expired</option>
                          </select>
                          <button
                            onClick={() => handleSaveStatus(record.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-700"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId !== record.id && (
                        <button
                          onClick={() => handleEditStatus(record.id, record.status)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {records.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No registered documents yet.</p>
            <p className="text-slate-500">Create a new TOR using the "Issue New TOR" module.</p>
          </div>
        )}
      </div>
    </div>
  );
};
