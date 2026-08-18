import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const dbFilePath = path.resolve(process.cwd(), 'src/data/db.json')

function readDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8')
      return JSON.parse(raw)
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

function syncPlugin() {
  return {
    name: 'eco-clean-sync-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // SSE Real-time events stream across all devices
        if (req.url === '/api/events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
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
        if (req.url === '/api/data' && req.method === 'GET') {
          const db = readDb()
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          })
          res.end(JSON.stringify(db))
          return
        }

        // Sync slice or full DB
        if (req.url === '/api/sync' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const { sliceKey, data } = JSON.parse(body)
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
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncPlugin()],
  server: {
    host: true, // Listen on all network interfaces (Wi-Fi, LAN, etc.)
    port: 5173
  },
  preview: {
    host: true,
    port: 5173
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore']
  }
})
