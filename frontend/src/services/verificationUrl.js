const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const isLocalHost = (hostname) => LOCAL_HOSTS.has(hostname?.toLowerCase?.() ?? '');

const parseOrigin = (url) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/** True when this origin only works on the same machine (not on a phone). */
export const isLocalOnlyOrigin = (originOrUrl) => {
  const parsed = parseOrigin(originOrUrl);
  if (!parsed) return true;
  return isLocalHost(parsed.hostname);
};

/**
 * Base URL for QR codes and public verification links.
 * Prefers VITE_PUBLIC_URL (LAN IP from npm run dev), then current browser host if not localhost.
 */
export const getPublicOrigin = () => {
  const fromEnv = import.meta.env.VITE_PUBLIC_URL?.replace(/\/$/, '');
  if (fromEnv && !isLocalOnlyOrigin(fromEnv)) {
    return fromEnv;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (!isLocalHost(hostname)) {
      const hostPort = port ? `${hostname}:${port}` : hostname;
      return `${protocol}//${hostPort}`;
    }
  }

  return fromEnv || (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '');
};

/** Public verification URL encoded in each TOR QR code (opened on mobile after scan). */
export const buildVerificationUrl = (verificationToken) => {
  const base = getPublicOrigin();

  if (!base || isLocalOnlyOrigin(base)) {
    throw new Error(
      'QR codes cannot use localhost on a phone. Stop the dev server, run "npm run dev" again (it writes your LAN IP to .env.local), then register the TOR again so the PDF gets a new QR code.'
    );
  }

  return `${base}/verify?token=${encodeURIComponent(verificationToken)}`;
};
