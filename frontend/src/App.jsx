import { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { FeedbackMessage } from './components/FeedbackMessage';
import { PublicVerificationPortal } from './components/PublicVerificationPortal';
import { auth, setAuthToken, getAuthToken, health, tor, auditLogs } from './api/client';
import LoginPage from './components/LoginPage';

const IssueNewTOR = lazy(() => import('./components/IssueNewTOR').then((module) => ({ default: module.IssueNewTOR })));
const RegisteredDocuments = lazy(() => import('./components/RegisteredDocuments').then((module) => ({ default: module.RegisteredDocuments })));
const AuditTrailLogs = lazy(() => import('./components/AuditTrailLogs').then((module) => ({ default: module.AuditTrailLogs })));

function BackendUnavailable({ onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Connection unavailable</h1>
        <p className="text-slate-600 text-sm mb-4">
          We could not reach the registrar service. Check your connection and try again.
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
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [adminDataError, setAdminDataError] = useState('');
  const connectionCheckRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [portal, setPortal] = useState(() =>
    !new URLSearchParams(window.location.search).get('token') && window.location.pathname.endsWith('/login')
      ? 'admin' : 'public'
  );
  const [activeModule, setActiveModuleState] = useState(readStoredAdminModule);

  const setActiveModule = useCallback((module) => {
    if (!ADMIN_MODULES.has(module)) return;
    setActiveModuleState(module);
    sessionStorage.setItem(ADMIN_MODULE_KEY, module);
  }, []);
  const [torRecords, setTorRecords] = useState([]);
  const [revokedCount, setRevokedCount] = useState(0);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [verificationToken, setVerificationToken] = useState(() => new URLSearchParams(window.location.search).get('token'));

  const loadAuditLogs = useCallback(async () => {
    const auditRes = await auditLogs.list(1, 100);
    setAuditLogsList(auditRes.logs || []);
  }, []);

  const loadAdminData = useCallback(async () => {
    const torRes = await tor.list(1, 100);
    setTorRecords(torRes.records || []);
    setRevokedCount(torRes.revokedCount ?? 0);
    setAdminDataError('');
  }, []);

  /** Refresh audit logs while the Audit Trail screen is open (verifications, etc.). */
  useEffect(() => {
    if (!isLoggedIn || portal !== 'admin' || activeModule !== 'auditTrail') {
      return undefined;
    }

    let cancelled = false;

    let refreshing = false;
    const refresh = async () => {
      if (cancelled || refreshing) return;
      refreshing = true;
      try {
        await loadAuditLogs();
      } catch (err) {
        console.error('Audit log refresh failed:', err);
      } finally {
        refreshing = false;
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, portal, activeModule, loadAuditLogs]);

  const checkBackend = useCallback(() => {
    if (connectionCheckRef.current) return connectionCheckRef.current;
    const request = health().then(async () => {
      setBackendReady(true);

      if (getAuthToken()) {
        try {
          const userData = await auth.getMe();
          setCurrentUser(userData.user);
          setIsLoggedIn(true);
          await loadAdminData().catch(() => setAdminDataError('Records could not be loaded. Try loading them again.'));
        } catch {
          setAuthToken(null);
          setCurrentUser(null);
          setIsLoggedIn(false);
          setTorRecords([]);
          setAuditLogsList([]);
        }
      }
    }).catch(() => {
      setBackendReady(false);
    }).finally(() => {
      setCheckingBackend(false);
      connectionCheckRef.current = null;
    });
    connectionCheckRef.current = request;
    return request;
  }, [loadAdminData]);

  const retryConnection = () => {
    setCheckingBackend(true);
    checkBackend();
  };

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
      await loadAdminData().catch(() => setAdminDataError('You are signed in, but records could not be loaded. Try loading them again.'));
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
    await loadAdminData().catch(() => setAdminDataError('The TOR was saved, but the document list could not refresh. Reload the list before making another change.'));
  };

  const handleRevoke = async (recordId) => {
    await tor.revoke(recordId);
    setTorRecords((records) => records.filter((record) => record.id !== recordId));
    setRevokedCount((count) => count + 1);
    await loadAdminData().catch(() => setAdminDataError('The TOR was revoked, but the document list could not refresh. Reload the list to see the latest records.'));
  };

  if (checkingBackend && portal === 'admin') {
    return (
      <div role="status" className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Connecting to server…
      </div>
    );
  }

  if (!backendReady && portal === 'admin') {
    return <BackendUnavailable onRetry={retryConnection} />;
  }

  if (portal === 'public') {
    return (
      <PublicVerificationPortal
        verificationToken={verificationToken}
        backendChecking={checkingBackend}
        backendReady={backendReady}
        onRetryConnection={retryConnection}
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
    <div className="flex h-screen flex-col md:flex-row bg-slate-50">
      <AdminSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onSwitchToPublic={() => setPortal('public')}
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex min-h-0 min-w-0 flex-col flex-1 overflow-hidden">
        {adminDataError && <div className="p-4"><FeedbackMessage tone="error" title="Document list needs refreshing">
          {adminDataError}{' '}
          <button type="button" onClick={() => loadAdminData().catch(() => setAdminDataError('Records could not be loaded. Please try again.'))} className="font-semibold underline">Reload records</button>
        </FeedbackMessage></div>}
        <Suspense fallback={<p role="status" className="p-8 text-slate-600">Loading registrar tools…</p>}>
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
        </Suspense>
      </div>
    </div>
  );
}

export default App;
