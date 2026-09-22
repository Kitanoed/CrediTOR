async function sourceToUint8Array(source) {
  if (source instanceof Uint8Array) return source.slice();
  if (source instanceof ArrayBuffer) return new Uint8Array(source.slice(0));
  if (source instanceof Blob) {
    const buffer = await source.arrayBuffer();
    return new Uint8Array(buffer);
  }
  if (typeof source === 'string') {
    const response = await fetch(source);
    if (!response.ok) throw new Error('Could not load the TOR PDF for printing.');
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
  throw new Error('Could not load the TOR PDF for printing.');
}

/** Opens the PDF in the browser's native viewer, where the user can preview and print it. */
export async function printPdfFromUrl(source, existingPreviewWindow = null) {
  const previewWindow = existingPreviewWindow || window.open('', '_blank');
  if (!previewWindow) {
    throw new Error('Please allow pop-ups for this site to preview the TOR PDF.');
  }

  previewWindow.document.title = 'Preparing PDF preview...';

  try {
    const data = await sourceToUint8Array(source);
    const pdfBlob = new Blob([data], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    previewWindow.location.href = pdfUrl;

    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60 * 60 * 1000);
  } catch (error) {
    previewWindow.close();
    throw error;
  }
}
