// Oddiy server: saytni koʻrsatadi va aloqa formasidagi xabarni Telegram botga yuboradi.
// Qoʻshimcha paket oʻrnatish shart emas (npm install kerak emas).
const http = require('http');
const fs = require('fs');
const path = require('path');

// .env faylidan BOT_TOKEN va CHAT_ID ni oʻqiydi
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(function (line) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) { /* .env yoʻq boʻlsa, oʻtkazib yuboramiz */ }

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf'
};
const lastSent = new Map(); // bir odam ketma-ket koʻp yubormasligi uchun

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let data = '';
    req.on('data', function (c) {
      data += c;
      if (data.length > 10000) { reject(new Error('Juda katta soʻrov')); req.destroy(); }
    });
    req.on('end', function () { resolve(data); });
    req.on('error', reject);
  });
}

async function handleContact(req, res) {
  try {
    const ip = req.socket.remoteAddress;
    const now = Date.now();
    if (now - (lastSent.get(ip) || 0) < 30000) {
      return sendJson(res, 429, { ok: false, error: 'Iltimos, 30 soniya kutib qayta urinib koʻring.' });
    }
    const b = JSON.parse((await readBody(req)) || '{}');
    if (b.website) return sendJson(res, 200, { ok: true }); // bot tuzogʻi: odam toʻldirmaydi
    const name = String(b.name || '').trim().slice(0, 80);
    const reach = String(b.reach || '').trim().slice(0, 120);
    const message = String(b.message || '').trim().slice(0, 2000);
    if (!name || !message) return sendJson(res, 400, { ok: false, error: 'Ism va xabarni toʻldiring.' });
    if (!BOT_TOKEN || !CHAT_ID) {
      return sendJson(res, 500, { ok: false, error: 'Server sozlanmagan (.env faylini tekshiring).' });
    }
    const text = 'Saytdan yangi xabar\nIsm: ' + name + '\nAloqa: ' + (reach || 'koʻrsatilmagan') + '\n\n' + message;
    const r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text })
    });
    if (!r.ok) {
      console.error('Telegram xatosi:', r.status, await r.text());
      return sendJson(res, 502, { ok: false, error: 'Telegramga yuborib boʻlmadi.' });
    }
    lastSent.set(ip, now);
    sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error(e.message);
    sendJson(res, 400, { ok: false, error: 'Soʻrov notoʻgʻri.' });
  }
}

http.createServer(function (req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/api/contact') return handleContact(req, res);
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }

  let p;
  try { p = path.normalize(decodeURIComponent(url.pathname)); }
  catch (e) { res.writeHead(400); return res.end(); }
  if (p === path.sep || p === '/') p = '/index.html';

  const file = path.join(PUBLIC_DIR, p);
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Topilmadi'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, function () {
  console.log('Sayt ishga tushdi: http://localhost:' + PORT);
  if (!BOT_TOKEN || !CHAT_ID) console.log('Diqqat: .env faylida BOT_TOKEN va CHAT_ID yoʻq, aloqa formasi ishlamaydi.');
});
