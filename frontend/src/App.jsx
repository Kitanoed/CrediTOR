import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { IssueNewTOR } from './components/IssueNewTOR';
import { RegisteredDocuments } from './components/RegisteredDocuments';
import { AuditTrailLogs } from './components/AuditTrailLogs';
import { PublicVerificationPortal } from './components/PublicVerificationPortal';
import { auth, setAuthToken, getAuthToken, health, tor, auditLogs } from './api/client';
import LoginPage from './components/LoginPage';

function BackendUnavailable({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Backend unavailable</h1>
        <p className="text-slate-600 text-sm mb-4">
          The frontend could not reach the Spring Boot API at{' '}
          <code className="text-slate-800">/api</code> (proxied to Spring Boot on port 8081).
        </p>
        {error && (
          <p className="text-red-600 text-xs mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <code className="text-xs bg-slate-100 px-3 py-2 rounded block text-left text-slate-700 mb-4">
          cd backend/creditor/creditor
          <br />
          .\mvnw.cmd spring-boot:run
        </code>
        <p className="text-xs text-slate-500 mb-4">
          Supabase settings go in <code>application.properties</code> or a <code>.env</code> file in
          that folder. If port 8080 is already in use, stop the other process and restart.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          Retry connection
        </button>
      </div>
    </div>
  );
}

const ADMIN_MODULES = new Set(['issueNewTOR', 'registeredDocuments', 'auditTrail']);
const ADMIN_MODULE_KEY = 'creditor.adminModule';

const readStoredAdminModule = () => {
  try {
    const stored = sessionStorage.getItem(ADMIN_MODULE_KEY);
    return ADMIN_MODULES.has(stored) ? stored : 'issueNewTOR';
  } catch {
    return 'issueNewTOR';
  }
};

function App() {
  const [backendReady, setBackendReady] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const hasQrTokenOnLoad = () => {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('token'));
  };

  const [checkingBackend, setCheckingBackend] = useState(
    () => !hasQrTokenOnLoad() && !sessionStorage.getItem('creditor.backendOk')
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [portal, setPortal] = useState('public');
  const [activeModule, setActiveModuleState] = useState(readStoredAdminModule);

  const setActiveModule = useCallback((module) => {
    if (!ADMIN_MODULES.has(module)) return;
    setActiveModuleState(module);
    sessionStorage.setItem(ADMIN_MODULE_KEY, module);
  }, []);
  const [torRecords, setTorRecords] = useState([]);
  const [revokedCount, setRevokedCount] = useState(0);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [verificationToken, setVerificationToken] = useState(null);

  const loadAuditLogs = useCallback(async () => {
    const auditRes = await auditLogs.list(1, 100);
    setAuditLogsList(auditRes.logs || []);
  }, []);

  const loadAdminData = useCallback(async () => {
    const [torRes, auditRes] = await Promise.all([tor.list(1, 100), auditLogs.list(1, 100)]);
    setTorRecords(torRes.records || []);
    setRevokedCount(torRes.revokedCount ?? 0);
    setAuditLogsList(auditRes.logs || []);
  }, []);

  /** Refresh audit logs while the Audit Trail screen is open (verifications, etc.). */
  useEffect(() => {
    if (!isLoggedIn || activeModule !== 'auditTrail') {
      return undefined;
    }

    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      try {
        await loadAuditLogs();
      } catch (err) {
        console.error('Audit log refresh failed:', err);
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, activeModule, loadAuditLogs]);

  const checkBackend = useCallback(async () => {
    setCheckingBackend(true);
    setBackendError(null);
    try {
      await health();
      setBackendReady(true);
      sessionStorage.setItem('creditor.backendOk', '1');

      if (getAuthToken()) {
        try {
          const userData = await auth.getMe();
          setCurrentUser(userData.user);
          setIsLoggedIn(true);
          await loadAdminData();
        } catch {
          setAuthToken(null);
          setCurrentUser(null);
          setIsLoggedIn(false);
          setTorRecords([]);
          setAuditLogsList([]);
        }
      }
    } catch (err) {
      setBackendReady(false);
      setBackendError(err.message || 'Connection failed');
    } finally {
      setCheckingBackend(false);
    }
  }, [loadAdminData]);

  const goToPublicPortal = useCallback(() => {
    setVerificationToken(null);
    setPortal('public');
    window.history.replaceState({}, '', '/');
  }, []);

  const goToRegistrarLogin = useCallback(() => {
    setPortal('admin');
    window.history.replaceState({}, '', '/login');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const path = window.location.pathname;
    const onVerifyRoute = path === '/verify' || path.endsWith('/verify');
    const onLoginRoute = path === '/login' || path.endsWith('/login');

    if (token) {
      setVerificationToken(token);
      setPortal('public');
    } else if (onVerifyRoute) {
      setPortal('public');
    } else if (onLoginRoute) {
      setPortal('admin');
    } else {
      setPortal('public');
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await auth.login(email, password);
      setAuthToken(result.token);
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      setPortal('admin');
      window.history.replaceState({}, '', '/login');
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      setIsLoggedIn(false);
      setTorRecords([]);
      setAuditLogsList([]);
      setActiveModuleState('issueNewTOR');
      sessionStorage.removeItem(ADMIN_MODULE_KEY);
      setPortal('public');
      window.history.replaceState({}, '', '/');
    }
  };

  const handleRecordCreated = async () => {
    await loadAdminData();
  };

  const handleRevoke = async (recordId) => {
    await tor.revoke(recordId);
    await loadAdminData();
  };

  const qrTokenActive = hasQrTokenOnLoad() || verificationToken;

  if (checkingBackend && !qrTokenActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Connecting to server…
      </div>
    );
  }

  if (!backendReady && !qrTokenActive) {
    return <BackendUnavailable error={backendError} onRetry={checkBackend} />;
  }

  if (portal === 'public') {
    return (
      <PublicVerificationPortal
        verificationToken={verificationToken}
        backendChecking={checkingBackend}
        backendReady={backendReady}
        isRegistrarLoggedIn={isLoggedIn}
        onClearToken={() => {
          setVerificationToken(null);
          window.history.replaceState({}, '', '/verify');
        }}
        onRegistrarLogin={goToRegistrarLogin}
        onGoToRegistrarPortal={() => {
          setPortal('admin');
          window.history.replaceState({}, '', '/login');
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
        onBackToPublic={goToPublicPortal}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onSwitchToPublic={() => setPortal('public')}
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {activeModule === 'issueNewTOR' && (
          <IssueNewTOR onRecordCreated={handleRecordCreated} />
        )}
        {activeModule === 'registeredDocuments' && (
          <RegisteredDocuments
            records={torRecords}
            revokedCount={revokedCount}
            onRevoke={handleRevoke}
          />
        )}
        {activeModule === 'auditTrail' && <AuditTrailLogs logs={auditLogsList} />}
      </div>
    </div>
  );
}

export default App;
