import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { IssueNewTOR } from './components/IssueNewTOR';
import { RegisteredDocuments } from './components/RegisteredDocuments';
import { AuditTrailLogs } from './components/AuditTrailLogs';
import { PublicVerificationPortal } from './components/PublicVerificationPortal';
import { initialTORRecords, initialAuditLogs } from './services/mockData';

function App() {
  // State Management
  const [portal, setPortal] = useState('admin'); // 'admin' or 'public'
  const [activeModule, setActiveModule] = useState('issueNewTOR');
  const [torRecords, setTorRecords] = useState(initialTORRecords);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [verificationToken, setVerificationToken] = useState(null);

  // Check for verification token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setVerificationToken(token);
      setPortal('public');
    }
  }, []);

  // Handle new TOR record creation
  const handleRecordCreated = (newRecord) => {
    // Add the new record to the list
    setTorRecords((prev) => [newRecord, ...prev]);

    // Add audit log for record creation
    const auditLog = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'Record Creation',
      dcn: newRecord.dcn,
      details: `New TOR record created for ${newRecord.fullName} (${newRecord.studentId})`,
      registrarId: 'REG-001',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);
  };

  // Handle status change
  const handleStatusChange = (recordId, newStatus) => {
    const record = torRecords.find((r) => r.id === recordId);
    if (record) {
      // Update record status
      setTorRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, status: newStatus } : r
        )
      );

      // Add audit log for status change
      const auditLog = {
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'Status Update',
        dcn: record.dcn,
        details: `Status of ${record.dcn} changed from ${record.status} to ${newStatus}`,
        registrarId: 'REG-001',
      };
      setAuditLogs((prev) => [auditLog, ...prev]);
    }
  };

  // Portal Switch
  const handleSwitchToPublic = () => {
    setPortal('public');
  };

  const handleSwitchToAdmin = () => {
    setPortal('admin');
  };

  // Admin Portal Layout
  if (portal === 'admin') {
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <AdminSidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          onSwitchToPublic={handleSwitchToPublic}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* Content */}
          {activeModule === 'issueNewTOR' && (
            <IssueNewTOR onRecordCreated={handleRecordCreated} />
          )}

          {activeModule === 'registeredDocuments' && (
            <RegisteredDocuments records={torRecords} onStatusChange={handleStatusChange} />
          )}

          {activeModule === 'auditTrail' && (
            <AuditTrailLogs logs={auditLogs} />
          )}
        </div>
      </div>
    );
  }

  // Public Portal Layout
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 to-slate-900">
      {/* Back to Admin Button - Subtle */}
      <button
        onClick={handleSwitchToAdmin}
        className="fixed top-4 right-4 px-4 py-2 bg-slate-700 bg-opacity-80 text-white rounded hover:bg-slate-600 text-sm font-semibold z-50 backdrop-blur-sm"
      >
        ← Admin Portal
      </button>

      {/* Public Portal */}
      <PublicVerificationPortal
        torRecords={torRecords}
        onVerification={() => {}}
        verificationToken={verificationToken}
      />
    </div>
  );
}

export default App;