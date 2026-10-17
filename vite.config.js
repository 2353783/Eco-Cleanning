import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const dbFilePath = path.resolve(process.cwd(), 'data/db.json')
const legacyDbFilePath = path.resolve(process.cwd(), 'src/data/db.json')

function readDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8')
      return JSON.parse(raw)
    }
    if (fs.existsSync(legacyDbFilePath)) {
      const raw = fs.readFileSync(legacyDbFilePath, 'utf-8')
      const data = JSON.parse(raw)
      writeDb(data)
      return data
    }
  } catch (e) {
    console.error('[Server DB] Read error:', e)
  }
  return { clients: [], agents: [], admins: [], passages: [], complaints: [], lastUpdated: Date.now() }
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true })
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('[Server DB] Write error:', e)
  }
}

const sseClients = new Set()

function createSyncMiddleware() {
  return (req, res, next) => {
    const rawUrl = req.url || ''
    const pathname = rawUrl.split('?')[0]

    // Cross-device CORS headers for all phones & web clients
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    // SSE Real-time events stream across all devices
    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      })
      res.write(`data: ${JSON.stringify({ type: 'INIT', payload: readDb() })}\n\n`)
      sseClients.add(res)

      req.on('close', () => {
        sseClients.delete(res)
      })
      return
    }

    // Get full DB
    if (pathname === '/api/data' && req.method === 'GET') {
      const db = readDb()
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify(db))
      return
    }

    // Sync slice or full DB
    if (pathname === '/api/sync' && req.method === 'POST') {
      const chunks = []
      req.on('data', chunk => { chunks.push(chunk) })
      req.on('end', () => {
        try {
          const bodyStr = Buffer.concat(chunks).toString('utf-8')
          const { sliceKey, data } = JSON.parse(bodyStr || '{}')
          const currentDb = readDb()
          if (sliceKey) {
            currentDb[sliceKey] = data
          }
          currentDb.lastUpdated = Date.now()
          writeDb(currentDb)

          // Broadcast to all connected phones/devices via SSE
          const message = JSON.stringify({
            type: 'SYNC_STATE',
            payload: { sliceKey, data, timestamp: currentDb.lastUpdated }
          })
          sseClients.forEach(client => {
            try {
              client.write(`data: ${message}\n\n`)
            } catch {
              sseClients.delete(client)
            }
          })

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          })
          res.end(JSON.stringify({ success: true, timestamp: currentDb.lastUpdated }))
        } catch (err) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          })
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      return
    }

    next()
  }
}

function syncPlugin() {
  const middleware = createSyncMiddleware()
  return {
    name: 'eco-clean-sync-server',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncPlugin()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
    watch: {
      ignored: ['**/data/**']
    }
  },
  preview: {
    host: true,
    port: 5173
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore']
  }
})
