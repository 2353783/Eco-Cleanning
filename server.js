import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5173;
const distDir = path.resolve(__dirname, 'dist');
const dbFilePath = path.resolve(__dirname, 'data/db.json');
const legacyDbFilePath = path.resolve(__dirname, 'src/data/db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

function readDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    }
    if (fs.existsSync(legacyDbFilePath)) {
      const data = JSON.parse(fs.readFileSync(legacyDbFilePath, 'utf-8'));
      writeDb(data);
      return data;
    }
  } catch (e) {
    console.error('[Server DB] Read error:', e);
  }
  return { clients: [], agents: [], admins: [], passages: [], complaints: [], lastUpdated: Date.now() };
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server DB] Write error:', e);
  }
}

const sseClients = new Set();

function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback SPA vers index.html
      const indexPath = path.join(distDir, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Eco Clean - 404 Not Found (Build the app with npm run build first)');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Caching pour les assets statiques avec hash
    const isImmutable = filePath.includes(path.sep + 'assets' + path.sep);
    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (isImmutable) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const parsedUrl = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Cross-device CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. SSE Stream pour push temps réel instantané
  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'INIT', payload: readDb() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 2. Récupérer toute la DB
  if (pathname === '/api/data' && req.method === 'GET') {
    const db = readDb();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(db));
    return;
  }

  // 3. Endpoint de synchronisation temps réel
  if (pathname === '/api/sync' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const { sliceKey, data } = JSON.parse(bodyStr || '{}');
        const currentDb = readDb();
        if (sliceKey) {
          currentDb[sliceKey] = data;
        }
        currentDb.lastUpdated = Date.now();
        writeDb(currentDb);

        // Diffuser en push SSE à tous les téléphones/clients connectés
        const message = JSON.stringify({
          type: 'SYNC_STATE',
          payload: { sliceKey, data, timestamp: currentDb.lastUpdated }
        });

        sseClients.forEach(client => {
          try {
            client.write(`data: ${message}\n\n`);
          } catch {
            sseClients.delete(client);
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, timestamp: currentDb.lastUpdated }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. Servir les fichiers statiques de l'application (dist/)
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(distDir, safePath);

  serveStaticFile(req, res, filePath);
});

server.on('error', (err) => {
  if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
    const altPort = Number(PORT) === 5173 ? 3000 : Number(PORT) + 1;
    console.warn(`[Eco Clean] Port ${PORT} occupé ou restreint (${err.code}), bascule automatique sur le port ${altPort}...`);
    server.listen(altPort);
  } else {
    console.error('[Eco Clean Server error]:', err);
  }
});

server.listen(PORT, () => {
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : PORT;
  console.log(`[Eco Clean RDC] Serveur opérationnel sur http://localhost:${actualPort}`);
});
