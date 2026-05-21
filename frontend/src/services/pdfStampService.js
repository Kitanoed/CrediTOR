import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

function stampPage(page, { qrImage, font, fontBold, dcn, studentId, fullName, pageIndex, pageCount }) {
  const { width } = page.getSize();

  const margin = 36;
  const qrSize = 88;
  const panelWidth = 260;
  const panelHeight = 102;
  const panelX = width - margin - panelWidth;
  const panelY = margin;

  page.drawRectangle({
    x: panelX,
    y: panelY,
    width: panelWidth,
    height: panelHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.15, 0.35, 0.75),
    borderWidth: 1.5,
  });

  page.drawImage(qrImage, {
    x: panelX + 10,
    y: panelY + 8,
    width: qrSize,
    height: qrSize,
  });

  const textX = panelX + 10 + qrSize + 10;
  let textY = panelY + panelHeight - 18;

  page.drawText('CrediTOR Verification', {
    x: textX,
    y: textY,
    size: 8,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.75),
  });
  textY -= 14;

  page.drawText('Document Control No.', {
    x: textX,
    y: textY,
    size: 7,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  textY -= 14;

  page.drawText(dcn, {
    x: textX,
    y: textY,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  textY -= 14;

  page.drawText(`ID: ${studentId}`, {
    x: textX,
    y: textY,
    size: 7,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  textY -= 11;

  const nameLine = fullName.length > 28 ? `${fullName.slice(0, 28)}…` : fullName;
  page.drawText(nameLine, {
    x: textX,
    y: textY,
    size: 7,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  textY -= 11;

  page.drawText('Scan QR to verify authenticity', {
    x: textX,
    y: textY,
    size: 6,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  if (pageCount > 1) {
    page.drawText(`Page ${pageIndex + 1} of ${pageCount}`, {
      x: panelX,
      y: panelY + panelHeight + 6,
      size: 6,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
}

/**
 * Embeds verification QR code and DCN on every page of the uploaded TOR PDF.
 */
export async function stampTorPdf(file, { dcn, verificationUrl, studentId, fullName }) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageCount = pages.length;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
  });
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const stampData = { qrImage, font, fontBold, dcn, studentId, fullName, pageCount };

  pages.forEach((page, index) => {
    stampPage(page, { ...stampData, pageIndex: index });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
