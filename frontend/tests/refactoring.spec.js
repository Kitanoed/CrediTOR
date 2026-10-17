import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const record = {
  id: 'tor-1', dcn: 'DCN-12345', studentId: '2024-00123', fullName: 'Juan Dela Cruz',
  status: 'Active', dateIssued: '2026-05-21', verificationToken: 'test-token', uploadedFileName: 'tor.pdf',
};

const matched = (manualVerification = true) => ({
  found: true, verified: true, identityMatch: true, manualVerification, record,
  overallStatus: 'Verified', maskedName: 'J*** D*** C***', maskedStudentId: '20**-***23',
  statusMessage: 'Registrar record found.', matchSummary: 'Compare the name, student ID, and date issued.',
});

const photo = {
  name: 'camera.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', 'base64'),
};

async function mockApi(page, options = {}) {
  const state = { lookups: 0, photos: 0, revokes: 0, creates: 0, uploads: 0, records: [record], audit: [], pageErrors: [] };
  page.on('pageerror', (error) => state.pageErrors.push(error.message));
  // Every API request is intercepted; these tests never reach a real registrar service.
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    const reply = (json, status = 200) => route.fulfill({ json, status });
    if (path === '/api/health') {
      if (options.healthDelay) await new Promise((resolve) => setTimeout(resolve, options.healthDelay));
      return reply({ status: 'ok' }, options.healthStatus || 200);
    }
    if (path === '/api/auth/me' || path === '/api/auth/login') return reply({ token: 'test-auth', user: { fullName: 'Test Registrar' } });
    if (path === '/api/auth/logout') return reply({});
    if (path === '/api/tor' && route.request().method() === 'GET') {
      if (options.failRefresh && state.revokes) return reply({ error: 'List unavailable' }, 503);
      return reply({ records: state.records, revokedCount: state.revokes });
    }
    if (path === '/api/tor' && route.request().method() === 'POST') { state.creates++; return reply({ record }); }
    if (path === '/api/files/upload') { state.uploads++; return reply({}, options.uploadStatus || 200); }
    if (path === '/api/audit-logs') return reply({ logs: state.audit });
    if (path.includes('/verify/by-dcn/')) {
      state.lookups++;
      return options.lookup ? options.lookup(route, state) : reply(matched());
    }
    if (path.endsWith('/scan-photo')) {
      state.photos++;
      return options.scan ? options.scan(route, state) : reply(matched(false));
    }
    if (path.endsWith('/revoke')) {
      state.revokes++;
      if (options.revokeStatus) return reply({ error: 'Service unavailable' }, options.revokeStatus);
      state.records = [];
      return reply({ record: { ...record, status: 'Revoked' } });
    }
    if (path.includes('/files/download/')) return reply({ error: 'PDF temporarily unavailable' }, 503);
    return reply({ error: `Unexpected mocked route: ${path}` }, 501);
  });
  return state;
}

async function openRegistrar(page, module = 'registeredDocuments') {
  await page.addInitScript((activeModule) => {
    localStorage.setItem('authToken', 'test-auth');
    sessionStorage.setItem('creditor.adminModule', activeModule);
  }, module);
  await page.goto('/login');
}

async function choosePhoto(page) {
  await page.locator('input[type="file"]').last().setInputFiles(photo);
}

test('public instructions and DCN field are available while the server connects', async ({ page }) => {
  await mockApi(page, { healthDelay: 2500 });
  const requested = [];
  page.on('request', (request) => requested.push(request.url()));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Document Control Number (DCN)')).toBeVisible();
  await expect(page.getByText('To use QR verification', { exact: false })).toBeVisible();
  expect(requested.some((url) => /IssueNewTOR|pdfStampService|RegisteredDocuments/.test(url))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('DCN validation preserves custom formats and prevents repeated submissions', async ({ page }) => {
  const state = await mockApi(page, { lookup: async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return route.fulfill({ json: matched() });
  } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Enter the DCN');
  expect(state.lookups).toBe(0);
  const input = page.getByLabel('Document Control Number (DCN)');
  await input.fill(' tor-2026-a ');
  await input.press('Enter');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: 'Active record found' })).toBeVisible();
  expect(state.lookups).toBe(1);
  await page.getByRole('button', { name: 'Review verification details' }).click();
  await expect(input).toHaveValue('TOR-2026-A');
  expect(state.pageErrors).toEqual([]);
});

test('connection failures preserve the DCN and are not displayed as document failures', async ({ page }) => {
  const state = await mockApi(page, { lookup: (route, current) => current.lookups === 1
    ? route.fulfill({ status: 503, json: { error: 'Unavailable' } })
    : route.fulfill({ json: matched() }) });
  await page.goto('/');
  await page.getByLabel('Document Control Number (DCN)').fill(record.dcn);
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No document status was confirmed');
  await expect(page.getByLabel('Document Control Number (DCN)')).toHaveValue(record.dcn);
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Active record found' })).toBeVisible();
  expect(state.lookups).toBe(2);
});

test('a new lookup checks the current revoked status instead of a prior result', async ({ page }) => {
  const state = await mockApi(page, { lookup: (route, current) => route.fulfill({ json: current.lookups === 1
    ? matched() : { ...matched(), verified: false, revoked: true, overallStatus: 'Revoked' } }) });
  await page.goto('/');
  await page.getByLabel('Document Control Number (DCN)').fill(record.dcn);
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Active record found' })).toBeVisible();
  await page.getByRole('button', { name: 'Review verification details' }).click();
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Revoked', exact: true })).toBeVisible();
  expect(state.lookups).toBe(2);
});

test('missing records have a retry path that retains the entered DCN', async ({ page }) => {
  await mockApi(page, { lookup: (route) => route.fulfill({ json: { found: false, error: 'No document found' } }) });
  await page.goto('/');
  await page.getByLabel('Document Control Number (DCN)').fill('DCN-00000');
  await page.getByRole('button', { name: 'Verify Document', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Record not found' })).toBeFocused();
  await page.getByRole('button', { name: 'Review details and try again' }).click();
  await expect(page.getByLabel('Document Control Number (DCN)')).toHaveValue('DCN-00000');
});

for (const [status, title] of [['Scan Failed', 'Photo could not be checked'], ['Scan Unavailable', 'Photo check unavailable'], ['Identity Mismatch', 'Identity Mismatch']]) {
  test(`${status} uses distinct guidance and retains the QR flow on retry`, async ({ page }) => {
    await mockApi(page, { scan: (route) => route.fulfill({ json: { found: true, verified: false, identityMatch: false, overallStatus: status } }) });
    await page.goto('/verify?token=test-token');
    await choosePhoto(page);
    await page.getByRole('button', { name: 'Scan & verify', exact: true }).click();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Review details and try again' }).click();
    await expect(page.getByAltText('TOR details preview')).toBeVisible();
    await expect(page).toHaveURL(/token=test-token/);
    await page.getByRole('button', { name: 'Use a DCN instead' }).click();
    await expect(page.getByLabel('Document Control Number (DCN)')).toBeVisible();
    await expect(page).not.toHaveURL(/token=/);
  });
}

test('photo network errors retain the photo and successful retry explains the match', async ({ page }) => {
  const state = await mockApi(page, { scan: (route, current) => current.photos === 1
    ? route.abort('failed') : route.fulfill({ json: matched(false) }) });
  await page.goto('/verify?token=test-token');
  await choosePhoto(page);
  await page.getByRole('button', { name: 'Scan & verify', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your photo is still selected');
  await expect(page.getByAltText('TOR details preview')).toBeVisible();
  await page.getByRole('button', { name: 'Scan & verify', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Photo details matched' })).toBeVisible();
  await expect(page.getByText('It does not check every grade', { exact: false })).toBeVisible();
  expect(state.photos).toBe(2);
  expect(state.pageErrors).toEqual([]);
});

test('revocation names the TOR, allows cancellation, and confirms completion', async ({ page }) => {
  const state = await mockApi(page);
  await openRegistrar(page);
  await page.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Revoke this TOR?' });
  await expect(dialog).toContainText(record.dcn);
  await expect(dialog).toContainText('deletes its PDF');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(state.revokes).toBe(0);
  await page.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  await dialog.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('TOR revoked successfully');
  await expect(page.getByText('No registered documents yet.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(state.revokes).toBe(1);
  expect(state.pageErrors).toEqual([]);
});

test('revocation errors leave the record and confirmation available', async ({ page }) => {
  const state = await mockApi(page, { revokeStatus: 503 });
  await openRegistrar(page);
  await page.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Revocation could not be confirmed');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('cell', { name: record.dcn, exact: true })).toBeVisible();
  expect(state.revokes).toBe(1);
});

test('a refresh failure after revocation does not misreport the completed action', async ({ page }) => {
  await mockApi(page, { failRefresh: true });
  await openRegistrar(page);
  await page.getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Revoke TOR', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('TOR revoked successfully');
  await expect(page.getByRole('alert')).toContainText('The TOR was revoked, but the document list could not refresh');
});

test('PDF retrieval failures show actionable feedback and keep the record', async ({ page }) => {
  await mockApi(page);
  await openRegistrar(page);
  await page.getByRole('button', { name: 'Open PDF', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('PDF could not be opened');
  await expect(page.getByRole('cell', { name: record.dcn, exact: true })).toBeVisible();
});

test('registration validates details, saves a stamped PDF, and confirms success', async ({ page }) => {
  const state = await mockApi(page);
  await openRegistrar(page, 'issueNewTOR');
  await page.getByRole('button', { name: 'Register & Generate' }).click();
  await expect(page.getByRole('alert')).toContainText('Complete the TOR details');
  expect(state.creates).toBe(0);
  await page.locator('[name="studentId"]').fill(record.studentId);
  await page.locator('[name="firstName"]').fill('Juan');
  await page.locator('[name="lastName"]').fill('Dela Cruz');
  await page.locator('[name="dcn"]').fill(record.dcn);
  const pdf = await PDFDocument.create();
  pdf.addPage();
  await page.locator('#tor-pdf-input').setInputFiles({ name: 'tor.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) });
  await page.getByRole('button', { name: 'Register & Generate' }).click();
  await expect(page.getByRole('dialog', { name: 'TOR Registered Successfully' })).toBeVisible();
  expect(state.creates).toBe(1);
  expect(state.uploads).toBe(1);
  await page.getByRole('button', { name: 'Review registered TOR' }).click();
  await expect(page.getByRole('status')).toContainText('TOR registered successfully');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(state.pageErrors).toEqual([]);
});

test('registrars can open and close the verification QR code', async ({ page }) => {
  const state = await mockApi(page);
  await openRegistrar(page);
  await page.getByRole('button', { name: 'View QR', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Verification QR Code' });
  await expect(dialog).toContainText(record.dcn);
  await expect(dialog).toContainText('https://creditor.test/verify?token=test-token');
  await expect(dialog.locator('svg[width="220"]')).toBeVisible();
  await page.getByRole('button', { name: 'Close QR code' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.pageErrors).toEqual([]);
});

test('audit pagination survives changes from one page to multiple pages', async ({ page }) => {
  const state = await mockApi(page);
  const entry = { id: '1', eventType: 'Verification Success', dcn: record.dcn, timestamp: '2026-05-21T10:00:00Z', details: 'Verified', registrarId: 'Public verifier' };
  state.audit = [entry];
  await openRegistrar(page, 'auditTrail');
  await expect(page.getByRole('heading', { name: 'Audit Trail Logs', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Audit log pagination' })).not.toBeVisible();
  state.audit = Array.from({ length: 12 }, (_, index) => ({ ...entry, id: String(index) }));
  await expect(page.getByRole('navigation', { name: 'Audit log pagination' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('Showing 11–12 of 12 events')).toBeVisible();
  expect(state.pageErrors).toEqual([]);
});
