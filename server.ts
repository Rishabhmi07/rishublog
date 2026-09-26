import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory messages backup
let serverMessages: Array<{
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}> = [];

// Instant health check for Cloud Run startup/liveness probes
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: "Rishu's Tech Blog" });
});

// Admin Messages API
app.get('/api/messages', (_req, res) => {
  res.status(200).json({ messages: serverMessages });
});

app.post('/api/messages', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(name).trim(),
    email: String(email).trim(),
    subject: subject ? String(subject).trim() : 'Inquiry from Tech Blog',
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  serverMessages.unshift(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  serverMessages = serverMessages.filter((m) => m.id !== id);
  res.status(200).json({ success: true });
});

const distPath = path.resolve('dist');

// If the built bundle exists (which is generated during Cloud Run build), serve it immediately
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath, { maxAge: '1h' }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Dev mode fallback
  import('vite')
    .then(({ createServer }) => {
      return createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
    })
    .then((vite) => {
      app.use(vite.middlewares);
    })
    .catch((err) => {
      console.error('Failed to start Vite middleware:', err);
    });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on 0.0.0.0:${PORT}`);
});
