const PHOTO_KEY = 'creditor.pendingVerifyPhoto';
const TOKEN_KEY = 'creditor.pendingVerifyToken';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataUrlToFile = async (dataUrl, name = 'tor-photo.jpg') => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
};

/** Keep photo across mobile browser reloads after camera capture. */
export const savePendingVerifyPhoto = async (token, file) => {
  try {
    const dataUrl = await fileToDataUrl(file);
    sessionStorage.setItem(PHOTO_KEY, dataUrl);
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    /* ignore quota errors */
  }
};

export const loadPendingVerifyPhoto = async (token) => {
  try {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);
    const dataUrl = sessionStorage.getItem(PHOTO_KEY);
    if (!dataUrl) return null;
    if (token && savedToken && savedToken !== token) return null;
    const file = await dataUrlToFile(dataUrl);
    const previewUrl = dataUrl;
    return { file, previewUrl };
  } catch {
    return null;
  }
};

export const clearPendingVerifyPhoto = () => {
  sessionStorage.removeItem(PHOTO_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
