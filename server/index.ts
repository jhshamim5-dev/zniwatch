import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleProxyRequest } from './proxy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use((req, res, next) => {
  if (handleProxyRequest(req as any, res as any)) return;
  next();
});

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath, { maxAge: '1y', immutable: true, index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
