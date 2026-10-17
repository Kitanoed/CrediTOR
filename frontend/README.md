# React + Vite

## Refactoring checks

Run `npm run lint` and `npm run build` from this directory.

Browser regression tests cover public QR/DCN verification, retry behavior, result
explanations, registration, PDF retrieval errors, revocation, and audit pagination
at desktop and mobile sizes. API responses are simulated; the tests do not access
real registrar records or validate OCR accuracy.

Install the test browser with `npx playwright install chromium`, then run
`npm run test:e2e`. The test server uses port 4175 and does not modify `.env.local`.
To use an installed Chrome browser on PowerShell instead:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
