const crypto = require('crypto');

const SESSION_COOKIE = 'vi_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const sessions = new Map();

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

function hasCustomPassword() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((accumulator, chunk) => {
    const [key, ...rest] = chunk.trim().split('=');
    if (!key) return accumulator;
    accumulator[key] = decodeURIComponent(rest.join('=') || '');
    return accumulator;
  }, {});
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE] || '';
}

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_SECONDS * 1000) {
      sessions.delete(token);
    }
  }
}

function isAuthenticated(req) {
  pruneExpiredSessions();
  return sessions.has(getSessionToken(req));
}

function setCookie(res, value, maxAgeSeconds) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`
  );
}

function createSession(res) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    createdAt: Date.now()
  });
  setCookie(res, token, SESSION_TTL_SECONDS);
}

function clearSession(req, res) {
  const token = getSessionToken(req);
  if (token) {
    sessions.delete(token);
  }
  setCookie(res, '', 0);
}

function requireAdminSession(req) {
  if (isAuthenticated(req)) return;
  const error = new Error('请先登录后台');
  error.statusCode = 401;
  throw error;
}

function login(req, res, password) {
  if (String(password || '') !== getAdminPassword()) {
    const error = new Error('管理员密码不正确');
    error.statusCode = 401;
    throw error;
  }
  createSession(res);
  return getSessionInfo(req, true);
}

function getSessionInfo(req, forceAuthenticated = false) {
  return {
    authenticated: forceAuthenticated || isAuthenticated(req),
    hasCustomPassword: hasCustomPassword()
  };
}

module.exports = {
  DEFAULT_ADMIN_PASSWORD,
  clearSession,
  getSessionInfo,
  login,
  requireAdminSession
};
