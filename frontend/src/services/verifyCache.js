const CACHE_PREFIX = 'creditor.verify.v1:';
const inflight = new Map();

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
};

/** One verification API call per token/DCN per tab session (handles React Strict Mode remounts). */
export const verifyOnce = async (cacheKey, fetcher) => {
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const promise = fetcher()
    .then((result) => {
      writeCache(cacheKey, result);
      return result;
    })
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, promise);
  return promise;
};

export const clearVerifyCache = (cacheKey) => {
  sessionStorage.removeItem(CACHE_PREFIX + cacheKey);
  inflight.delete(cacheKey);
};
