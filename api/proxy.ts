import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import http from 'http';
import zlib from 'zlib';

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });

function getHeaders(url: string): Record<string, string> {
  let referer = 'https://hianime.to/';
  let origin = 'https://hianime.to';
  if (url.includes('megacloud'))    { referer = 'https://megacloud.com/';      origin = 'https://megacloud.com'; }
  else if (url.includes('rapid-cloud'))  { referer = 'https://rapid-cloud.co/';  origin = 'https://rapid-cloud.co'; }
  else if (url.includes('rabbitstream')) { referer = 'https://rabbitstream.net/'; origin = 'https://rabbitstream.net'; }
  else if (url.includes('vizcloud'))     { referer = 'https://vizcloud.co/';      origin = 'https://vizcloud.co'; }
  return {
    'Referer': referer, 'Origin': origin,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*', 'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0', 'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Site': 'cross-site',
    'Connection': 'keep-alive',
  };
}

function rewriteM3U8(body: string, baseUrl: string, proxyBase: string): string {
  const base = new URL(baseUrl);
  return body.split('\n').map(line => {
    const t = line.trim();
    if (!t) return line;
    if (t.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/g, (_m, uri) => {
        try { return `URI="${proxyBase}?url=${encodeURIComponent(new URL(uri, base).href)}"`; }
        catch { return _m; }
      });
    }
    try { return `${proxyBase}?url=${encodeURIComponent(new URL(t, base).href)}`; }
    catch { return line; }
  }).join('\n');
}

function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
}

function fetch(targetUrl: string, res: ServerResponse, attempt = 0): void {
  const isHttps = targetUrl.startsWith('https');
  const client = isHttps ? https : http;
  const agent = isHttps ? httpsAgent : httpAgent;

  const req = client.request(targetUrl, { method: 'GET', headers: getHeaders(targetUrl), agent, timeout: 20000 }, (upstream) => {
    const status = upstream.statusCode || 200;

    if ((status === 403 || status === 429 || status === 503) && attempt < 2) {
      upstream.resume();
      setTimeout(() => fetch(targetUrl, res, attempt + 1), 400 * (attempt + 1));
      return;
    }

    setCors(res);
    const ct = upstream.headers['content-type'] || '';
    const isM3U8 = ct.includes('mpegurl') || targetUrl.includes('.m3u8');

    if (isM3U8) {
      const enc = upstream.headers['content-encoding'] || '';
      let stream: NodeJS.ReadableStream = upstream;
      if (enc.includes('br')) stream = upstream.pipe(zlib.createBrotliDecompress());
      else if (enc.includes('gzip')) stream = upstream.pipe(zlib.createGunzip());
      else if (enc.includes('deflate')) stream = upstream.pipe(zlib.createInflate());

      const chunks: Buffer[] = [];
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('end', () => {
        const rewritten = rewriteM3U8(Buffer.concat(chunks).toString(), targetUrl, '/api/proxy');
        const out = Buffer.from(rewritten);
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Content-Length', out.length);
        res.setHeader('Cache-Control', 'no-cache');
        res.statusCode = 200;
        res.end(out);
      });
      stream.on('error', () => { if (!res.headersSent) { res.statusCode = 502; res.end('Stream error'); } });
    } else {
      res.statusCode = status;
      res.setHeader('Content-Type', ct || 'application/octet-stream');
      if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
      if (upstream.headers['content-range']) res.setHeader('Content-Range', upstream.headers['content-range'] as string);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      upstream.pipe(res);
    }
  });

  req.on('timeout', () => {
    req.destroy();
    if (attempt < 2) fetch(targetUrl, res, attempt + 1);
    else if (!res.headersSent) { res.statusCode = 504; res.end('Timeout'); }
  });
  req.on('error', (e) => {
    if (attempt < 2) setTimeout(() => fetch(targetUrl, res, attempt + 1), 300);
    else if (!res.headersSent) { res.statusCode = 502; res.end(`Error: ${e.message}`); }
  });
  req.end();
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') { setCors(res); res.statusCode = 204; res.end(); return; }

  const host = req.headers.host || 'localhost';
  const urlObj = new URL(req.url!, `https://${host}`);
  let targetUrl = urlObj.searchParams.get('url') || '';
  if (!targetUrl) {
    const b64 = urlObj.searchParams.get('b64');
    if (b64) try { targetUrl = Buffer.from(b64, 'base64').toString(); } catch {}
  }
  if (!targetUrl) { res.statusCode = 400; res.end('Missing url'); return; }

  fetch(decodeURIComponent(targetUrl), res, 0);
}
