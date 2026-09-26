import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Basic health check for Cloud Run container probes
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: "Rishu's Tech Blog" });
});

async function startServer() {
  if (!isProduction && fs.existsSync(path.resolve('vite.config.ts'))) {
    // In development mode, mount Vite middleware
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      // Fallback to serving dist if vite middleware fails
      const distPath = path.resolve('dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // In production, serve static assets from the build directory
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
