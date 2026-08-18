import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const dbFilePath = path.resolve(__dirname, 'src/data/db.json');

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

function readDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading db:', e);
  }
  return { clients: [], agents: [], admins: [], passages: [], complaints: [], lastUpdated: Date.now() };
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing db:', e);
  }
}

const sseClients = new Set();

// SSE Stream for Realtime Push to all phones & computers
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write(`data: ${JSON.stringify({ type: 'INIT', payload: readDb() })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Full DB Endpoint
app.get('/api/data', (req, res) => {
  res.json(readDb());
});

// Sync Endpoint
app.post('/api/sync', (req, res) => {
  try {
    const { sliceKey, data } = req.body;
    const currentDb = readDb();
    if (sliceKey) {
      currentDb[sliceKey] = data;
    }
    currentDb.lastUpdated = Date.now();
    writeDb(currentDb);

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

    res.json({ success: true, timestamp: currentDb.lastUpdated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Eco Clean RDC Server running on http://0.0.0.0:${PORT}`);
});
