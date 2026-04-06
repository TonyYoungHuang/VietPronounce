const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const adminAuth = require('./admin-auth');
const domain = require('./domain');
const store = require('./store');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const STATIC_FILES = {
  '/admin': 'admin.html',
  '/admin/': 'admin.html',
  '/admin/admin.css': 'admin.css',
  '/admin/admin.js': 'admin.js'
};
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

store.ensureStorage();

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(`${JSON.stringify(payload)}\n`);
}

function sendOk(res, data, statusCode = 200) {
  sendJson(res, statusCode, { ok: true, data });
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || '服务器错误';
  sendJson(res, statusCode, { ok: false, message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        const invalid = new Error('请求体不是合法 JSON');
        invalid.statusCode = 400;
        reject(invalid);
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, pathname) {
  const fileName = STATIC_FILES[pathname];
  if (!fileName) return false;
  const filePath = path.join(PUBLIC_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    sendError(res, { statusCode: 404, message: '接口不存在' });
    return true;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(fs.readFileSync(filePath));
  return true;
}

function unwrapBody(body, key) {
  if (body && body[key] && typeof body[key] === 'object') {
    return body[key];
  }
  return body;
}

async function handleApi(req, res, url) {
  const { pathname, searchParams } = url;
  const method = req.method;

  if (method === 'GET' && pathname === '/health') {
    sendOk(res, { status: 'ok', now: new Date().toISOString() });
    return;
  }
  if (method === 'GET' && pathname === '/api/catalog') {
    sendOk(res, domain.getCatalog());
    return;
  }
  if (method === 'GET' && pathname === '/api/trial') {
    sendOk(res, domain.getTrial(searchParams.get('dialect')));
    return;
  }
  if (method === 'POST' && pathname === '/api/auth/mock-login') {
    const body = await parseBody(req);
    sendOk(res, domain.mockLogin(body.nickName), 201);
    return;
  }
  if (method === 'POST' && pathname === '/api/auth/bind-phone') {
    const body = await parseBody(req);
    sendOk(res, domain.bindPhone(body.userId, body.phone));
    return;
  }
  if (method === 'GET' && pathname === '/api/user/state') {
    sendOk(res, domain.requireUser(searchParams.get('userId')));
    return;
  }
  if (method === 'POST' && pathname === '/api/user/dialect') {
    const body = await parseBody(req);
    sendOk(res, domain.updateDialect(body.userId, body.dialect));
    return;
  }
  if (method === 'POST' && pathname === '/api/redeem') {
    const body = await parseBody(req);
    sendOk(res, domain.redeemProduct(body.userId, body.code));
    return;
  }
  if (method === 'GET' && pathname === '/api/levels') {
    sendOk(res, domain.getLevels(searchParams.get('userId'), searchParams.get('dialect')));
    return;
  }
  if (method === 'GET' && pathname === '/api/lessons') {
    sendOk(res, domain.getLessons(searchParams.get('userId'), searchParams.get('dialect'), searchParams.get('levelId')));
    return;
  }
  if (method === 'POST' && pathname === '/api/progress/score') {
    const body = await parseBody(req);
    sendOk(res, domain.saveScore(body.userId, body.dialect, body.itemId, body.score));
    return;
  }
  if (method === 'GET' && pathname === '/api/weakness') {
    sendOk(res, domain.getWeakness(searchParams.get('userId'), searchParams.get('dialect')));
    return;
  }
  if (method === 'GET' && pathname === '/api/admin/session') {
    sendOk(res, adminAuth.getSessionInfo(req));
    return;
  }
  if (method === 'POST' && pathname === '/api/admin/session') {
    const body = await parseBody(req);
    sendOk(res, adminAuth.login(req, res, body.password));
    return;
  }
  if (method === 'DELETE' && pathname === '/api/admin/session') {
    adminAuth.clearSession(req, res);
    sendOk(res, adminAuth.getSessionInfo(req));
    return;
  }
  if (pathname.startsWith('/api/admin/')) {
    adminAuth.requireAdminSession(req);
  }
  if (method === 'GET' && pathname === '/api/admin/redeem-codes') {
    sendOk(res, domain.listRedeemCodes());
    return;
  }
  if (method === 'POST' && pathname === '/api/admin/redeem-codes') {
    const body = await parseBody(req);
    sendOk(res, domain.createRedeemCode(body), 201);
    return;
  }
  if (method === 'GET' && pathname === '/api/admin/catalog') {
    sendOk(res, domain.getCatalog());
    return;
  }
  if (method === 'PUT' && pathname === '/api/admin/catalog') {
    const body = await parseBody(req);
    sendOk(res, domain.saveCatalog(unwrapBody(body, 'catalog')));
    return;
  }
  if (method === 'GET' && pathname === '/api/admin/trial') {
    sendOk(res, { north: domain.getTrial('north'), south: domain.getTrial('south') });
    return;
  }
  if (method === 'PUT' && pathname === '/api/admin/trial') {
    const body = await parseBody(req);
    sendOk(res, domain.saveTrial(unwrapBody(body, 'trial')));
    return;
  }
  if (method === 'GET' && pathname === '/api/admin/users') {
    sendOk(res, domain.listUsers());
    return;
  }

  const error = new Error('接口不存在');
  error.statusCode = 404;
  throw error;
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (serveStatic(res, url.pathname)) {
      return;
    }
    await handleApi(req, res, url);
  } catch (error) {
    sendError(res, error);
  }
}

function start(port = Number(process.env.PORT) || 4100) {
  const server = http.createServer((req, res) => {
    void handleRequest(req, res);
  });
  server.listen(port, () => {
    console.log(`Backend listening on http://127.0.0.1:${port}`);
  });
  return server;
}

module.exports = {
  start
};
