import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pdfjsWorkerSrc = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const pdfjsWasmSrc = path.resolve(__dirname, 'node_modules/pdfjs-dist/wasm')

function mimeForPdfjsAsset(filePath) {
  if (filePath.endsWith('.mjs') || filePath.endsWith('.js')) return 'text/javascript'
  if (filePath.endsWith('.wasm')) return 'application/wasm'
  return 'application/octet-stream'
}

function sendPdfjsFile(filePath, res, next) {
  if (!fs.existsSync(filePath)) {
    next()
    return
  }
  res.setHeader('Content-Type', mimeForPdfjsAsset(filePath))
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache')
  fs.createReadStream(filePath).pipe(res)
}

/** Serve PDF.js worker/wasm from the current host (localhost or LAN IP). */
function pdfjsAssetsPlugin() {
  return {
    name: 'pdfjs-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url === '/pdfjs/pdf.worker.min.mjs') {
          sendPdfjsFile(pdfjsWorkerSrc, res, next)
          return
        }
        if (url.startsWith('/pdfjs/wasm/')) {
          const name = path.basename(url)
          if (name !== path.normalize(name) || name.includes('..')) {
            next()
            return
          }
          sendPdfjsFile(path.join(pdfjsWasmSrc, name), res, next)
          return
        }
        next()
      })
    },
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist')
      const dest = path.join(outDir, 'pdfjs')
      fs.mkdirSync(path.join(dest, 'wasm'), { recursive: true })
      fs.copyFileSync(pdfjsWorkerSrc, path.join(dest, 'pdf.worker.min.mjs'))
      fs.cpSync(pdfjsWasmSrc, path.join(dest, 'wasm'), { recursive: true })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8081'

  return {
    plugins: [
      react(),
      tailwindcss(),
      pdfjsAssetsPlugin(),
    ],
    appType: 'spa',
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      cors: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 5173,
      cors: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
