import React from 'react';
import { FileText, BookOpen, Clock, LogOut, Shield } from 'lucide-react';

export const AdminSidebar = ({ activeModule, onModuleChange, onSwitchToPublic }) => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col border-r border-slate-700 shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">CrediTOR</h1>
            <p className="text-xs text-slate-400">Registrar Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Issue New TOR */}
        <button
          onClick={() => onModuleChange('issueNewTOR')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeModule === 'issueNewTOR'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Issue New TOR</span>
        </button>

        {/* Registered Documents */}
        <button
          onClick={() => onModuleChange('registeredDocuments')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeModule === 'registeredDocuments'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">Registered Documents</span>
        </button>

        {/* Audit Trail Logs */}
        <button
          onClick={() => onModuleChange('auditTrail')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeModule === 'auditTrail'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-medium">Audit Trail Logs</span>
        </button>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {/* Switch to Public Portal */}
        <button
          onClick={onSwitchToPublic}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-blue-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">View Public Portal</span>
        </button>

        {/* Registrar Info */}
        <div className="px-4 py-3 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-medium text-slate-200">Registrar Admin</p>
        </div>
      </div>
    </div>
  );
};
