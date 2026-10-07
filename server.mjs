#!/usr/bin/env node
/* DTM 로컬 서버
   - UI 서버   (기본 4321): 미리보기 도구 화면 + 캡처 API (capture.mjs, playwright-core)
   - 프록시    (기본 4322): 대상 사이트를 그대로 중계하면서 bridge.js 를 주입 → 스크롤·이동 동기화
   사용법: node server.mjs [미리볼 주소 또는 포트] [--no-open]
     예)  node server.mjs 3000
          PORT=4400 node server.mjs http://localhost:5173 */
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { capture, closeBrowser, openFolder, pickFolder } from './capture.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const UI_PORT = Number(process.env.PORT) || 4321;
const PROXY_PORT = Number(process.env.PROXY_PORT) || UI_PORT + 1;
const HOST = '127.0.0.1';
const NO_OPEN = args.includes('--no-open');
const initialArg = args.find((a) => !a.startsWith('--'));

let target = null; // 프록시가 전달할 대상 origin (예: http://localhost:3000)

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4',
};
const PUBLIC = new Set([
  '/index.html', '/app.js', '/styles.css',
  '/effects.html', '/effects.css', '/effects.js', '/effects-data.js', // 웹 효과 도감
  '/shots.html', '/shots.css', '/shots.js', '/shots-data.js',         // 영상 샷 도감
]);
const ALIASES = { '/effects': '/effects.html', '/shots': '/shots.html' };
const PUBLIC_DIRS = /^\/assets\/[\w./-]+$/; // 이미지 폴더 (.. 금지)
const isPublic = (p) => PUBLIC.has(p) || (PUBLIC_DIRS.test(p) && !p.includes('..') && extname(p) in MIME);
const HEAD_RE = /<head(?:\s[^>]*)?>/i;
const BODY_RE = /<body(?:\s[^>]*)?>/i;
const CHARSET_RE = /<meta\s[^>]*charset[^>]*>/i;
const STRIP_RESPONSE_HEADERS = [
  'x-frame-options', 'content-security-policy', 'content-security-policy-report-only',
  'strict-transport-security', 'cross-origin-opener-policy', 'cross-origin-embedder-policy',
  'cross-origin-resource-policy', 'connection', 'keep-alive', 'transfer-encoding',
];

// ── UI 서버 ────────────────────────────────────────────────
const sameOrigin = (req) => req.headers.origin === `http://${req.headers.host}`;

// 캡처 관련 API: 도구 화면(같은 출처)에서 보낸 POST 만 허용
const ACTIONS = {
  '/__dtm/pick-folder': async (body) => ({ path: await pickFolder(body.current) }),
  '/__dtm/capture': (body) => capture(body),
  '/__dtm/open-folder': async (body) => { await openFolder(body.path); return { ok: true }; },
};

const ui = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');

  if (pathname === '/__dtm/info') return json(res, 200, { proxyPort: PROXY_PORT, target, capture: true });

  if (ACTIONS[pathname] && req.method === 'POST') {
    if (!sameOrigin(req)) return json(res, 403, { error: 'forbidden' });
    try {
      return json(res, 200, await ACTIONS[pathname](JSON.parse((await readBody(req)) || '{}')));
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
  }

  if (pathname === '/__dtm/target' && req.method === 'POST') {
    // 다른 사이트가 몰래 대상을 바꾸지 못하도록 같은 출처 요청만 허용
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return json(res, 403, { error: 'forbidden' });
    try {
      const { origin } = JSON.parse(await readBody(req));
      const u = new URL(origin);
      if (!/^https?:$/.test(u.protocol)) throw new Error('protocol');
      target = u.origin;
      return json(res, 200, { target });
    } catch {
      return json(res, 400, { error: 'invalid origin' });
    }
  }

  let file = '/index.html';
  try { if (pathname !== '/') file = decodeURIComponent(pathname); } catch { file = ''; }
  file = ALIASES[file] || file;
  if (!isPublic(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
  try {
    const data = await readFile(join(ROOT, file));
    const type = MIME[extname(file)];
    // 영상은 Range 요청(부분 전송)을 지원해야 Safari 에서 재생되고 구간 이동이 돼요
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      const size = data.length;
      let start = range[1] ? Number(range[1]) : size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : size - 1;
      start = Math.max(0, start);
      end = Math.min(end, size - 1);
      if (start > end) {
        res.writeHead(416, { 'content-range': `bytes */${size}` });
        return res.end();
      }
      res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1, 'cache-control': 'no-store' });
      return res.end(data.subarray(start, end + 1));
    }
    res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

// ── 프록시 ─────────────────────────────────────────────────
const proxy = http.createServer((req, res) => {
  if (!target) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('DTM: 미리볼 주소가 아직 설정되지 않았습니다.');
  }
  forward(req, res);
});
proxy.on('upgrade', forwardUpgrade); // HMR 웹소켓(Next.js, Vite 등)

function upstream(t) {
  const secure = t.protocol === 'https:';
  return { client: secure ? https : http, port: t.port || (secure ? 443 : 80) };
}

function forward(req, res) {
  const t = new URL(target);
  const { client, port } = upstream(t);
  const selfOrigin = `http://${req.headers.host}`;
  const headers = { ...req.headers, host: t.host };
  if (headers.origin) headers.origin = t.origin;
  if (headers.referer) headers.referer = headers.referer.replace(selfOrigin, t.origin);

  // 문서 요청은 압축·캐시 없이 받아서 bridge 를 주입
  const dest = req.headers['sec-fetch-dest'];
  const isDocument = dest === 'iframe' || dest === 'document' || (!dest && /text\/html/.test(req.headers.accept || ''));
  if (isDocument) {
    delete headers['accept-encoding'];
    delete headers['if-none-match'];
    delete headers['if-modified-since'];
  }

  const preq = client.request({ hostname: t.hostname, port, method: req.method, path: req.url, headers }, (pres) => {
    const h = rewriteHeaders(pres.headers, t.origin, selfOrigin);
    const isHtml = /text\/html/i.test(pres.headers['content-type'] || '');
    const hasBody = req.method !== 'HEAD' && pres.statusCode !== 204 && pres.statusCode !== 304;
    if (!isHtml || !hasBody) {
      res.writeHead(pres.statusCode, h);
      pres.pipe(res);
      return;
    }
    delete h['content-length'];
    delete h['content-encoding'];
    delete h.etag;
    h['cache-control'] = 'no-store';
    res.writeHead(pres.statusCode, h);
    injectBridge(decode(pres), res);
  });

  preq.on('error', (err) => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'content-type': 'text/html; charset=utf-8' });
    res.end(errorPage(t.origin, err));
  });
  req.on('aborted', () => preq.destroy());
  req.pipe(preq);
}

function rewriteHeaders(src, targetOrigin, selfOrigin) {
  const h = { ...src };
  for (const k of STRIP_RESPONSE_HEADERS) delete h[k];
  if (h.location && h.location.startsWith(targetOrigin)) h.location = selfOrigin + h.location.slice(targetOrigin.length);
  if (h['set-cookie']) {
    h['set-cookie'] = [].concat(h['set-cookie']).map((c) => c
      .replace(/;\s*domain=[^;]*/gi, '')
      .replace(/;\s*secure(?=;|$)/gi, '')
      .replace(/;\s*partitioned(?=;|$)/gi, '')
      .replace(/;\s*samesite=none/gi, '; SameSite=Lax'));
  }
  return h;
}

function decode(pres) {
  const enc = String(pres.headers['content-encoding'] || '').toLowerCase().trim();
  const d = enc === 'gzip' ? zlib.createGunzip()
    : enc === 'br' ? zlib.createBrotliDecompress()
    : enc === 'deflate' ? zlib.createInflate()
    : null;
  return d ? pres.pipe(d) : pres;
}

// 스트리밍 HTML 을 그대로 흘려보내면서 <head> 안에 bridge 를 끼워 넣습니다.
// <meta charset> 는 문서 앞 1024바이트 안에 있어야 하므로, 있으면 그 뒤에 넣습니다.
function injectBridge(src, res) {
  let tag;
  try {
    tag = `<script>${readFileSync(join(ROOT, 'bridge.js'), 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '')}</script>`;
  } catch {
    tag = '';
  }
  let buf = '';
  let done = false;
  const insertAt = (i) => { buf = buf.slice(0, i) + tag + buf.slice(i); };
  const tryInject = (final) => {
    const head = HEAD_RE.exec(buf);
    if (!head) return false;
    const headEnd = head.index + head[0].length;
    const charset = CHARSET_RE.exec(buf.slice(headEnd));
    if (charset) insertAt(headEnd + charset.index + charset[0].length);
    else if (final || buf.length - headEnd > 1024) insertAt(headEnd);
    else return false; // charset 메타가 다음 조각에 올 수 있으니 조금 더 기다림
    return true;
  };
  src.setEncoding('utf8');
  src.on('data', (chunk) => {
    if (done) return void res.write(chunk);
    buf += chunk;
    if (tryInject(false) || buf.length > 256 * 1024) {
      res.write(buf);
      buf = '';
      done = true;
    }
  });
  src.on('end', () => {
    if (!done) {
      if (!tryInject(true)) {
        const body = BODY_RE.exec(buf);
        if (body) insertAt(body.index + body[0].length);
        else buf += tag;
      }
      res.write(buf);
    }
    res.end();
  });
  src.on('error', () => res.end());
}

function forwardUpgrade(req, socket, head) {
  if (!target) return socket.destroy();
  const t = new URL(target);
  const { client, port } = upstream(t);
  const headers = { ...req.headers, host: t.host };
  if (headers.origin) headers.origin = t.origin;

  const preq = client.request({ hostname: t.hostname, port, method: req.method, path: req.url, headers });
  preq.on('upgrade', (pres, psocket, phead) => {
    const lines = [`HTTP/1.1 ${pres.statusCode} ${pres.statusMessage}`];
    for (let i = 0; i < pres.rawHeaders.length; i += 2) lines.push(`${pres.rawHeaders[i]}: ${pres.rawHeaders[i + 1]}`);
    socket.write(lines.join('\r\n') + '\r\n\r\n');
    if (phead && phead.length) socket.write(phead);
    if (head && head.length) psocket.write(head);
    psocket.pipe(socket).pipe(psocket);
    psocket.on('error', () => socket.destroy());
    socket.on('error', () => psocket.destroy());
    psocket.on('close', () => socket.destroy());
    socket.on('close', () => psocket.destroy());
  });
  preq.on('response', (pres) => {
    socket.end(`HTTP/1.1 ${pres.statusCode} ${pres.statusMessage}\r\n\r\n`);
    pres.resume();
  });
  preq.on('error', () => socket.destroy());
  socket.on('error', () => preq.destroy());
  preq.end();
}

// ── 유틸 ───────────────────────────────────────────────────
function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e5) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function errorPage(origin, err) {
  const safe = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<!doctype html><meta charset="utf-8"><title>연결 실패</title>
<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#0b0d11;color:#e8ecf2;font:14px/1.6 -apple-system,'Apple SD Gothic Neo',system-ui,sans-serif;text-align:center;padding:24px">
<div><div style="font-size:32px;margin-bottom:8px">⚠︎</div>
<b>${safe(origin)}</b> 에 연결할 수 없어요.<br>
<span style="color:#8a94a4">개발 서버가 켜져 있는지 확인해 주세요 (${safe(err.code || err.message)})</span></div></body>`;
}

function normalizeTarget(v) {
  if (!v) return null;
  if (/^\d{2,5}$/.test(v)) return `http://localhost:${v}`;
  return /^https?:\/\//i.test(v) ? v : `http://${v}`;
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
  exec(`${cmd} "${url}"`, () => {});
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, resolve);
  });
}

try {
  await listen(ui, UI_PORT);
  await listen(proxy, PROXY_PORT);
} catch (e) {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  포트 ${e.port} 가 이미 사용 중이에요. DTM이 이미 켜져 있는지 확인하거나 다른 포트를 지정하세요.\n  예) PORT=4400 node server.mjs\n`);
  } else {
    console.error(e);
  }
  process.exit(1);
}

const start = normalizeTarget(initialArg);
const uiUrl = `http://localhost:${UI_PORT}/${start ? `?url=${encodeURIComponent(start)}` : ''}`;
console.log(`
  DTM 반응형 미리보기
  ➜ 도구      http://localhost:${UI_PORT}
  ➜ 프록시    http://localhost:${PROXY_PORT}  (스크롤·이동 동기화용)
  종료: Ctrl+C
`);
if (!NO_OPEN) openBrowser(uiUrl);

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    await closeBrowser();
    process.exit(0);
  });
}
