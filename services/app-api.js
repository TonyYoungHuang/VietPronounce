const { getAppApiConfig } = require('../config/index');
const { buildUrl, request } = require('./request');

function parsePayload(response) {
  const payload = response && response.data;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      return { message: payload };
    }
  }
  return payload || {};
}

function assertOk(response) {
  const payload = parsePayload(response);
  if (!response || response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(payload.message || '服务暂时不可用，请稍后再试');
  }
  if (payload && payload.ok === false) {
    throw new Error(payload.message || '服务暂时不可用，请稍后再试');
  }
  return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function call(path, options = {}) {
  const config = getAppApiConfig();
  return request({
    url: buildUrl(config.baseUrl, path),
    timeout: config.timeout,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'content-type': 'application/json',
      ...(options.header || {})
    }
  }).then(assertOk);
}

function fetchCatalog() {
  return call('/api/catalog');
}

function checkHealth() {
  const config = getAppApiConfig();
  return call(config.healthPath || '/health');
}

function fetchPublicConfig() {
  return call('/api/config/public');
}

function fetchTrial(dialect) {
  return call('/api/trial', { data: { dialect } });
}

function createAnonymousUser() {
  return call('/api/auth/anonymous', {
    method: 'POST',
    data: {}
  });
}

function fetchUserState(userId) {
  return call('/api/user/state', { data: { userId } });
}

function updateDialect(userId, dialect) {
  return call('/api/user/dialect', {
    method: 'POST',
    data: { userId, dialect }
  });
}

function redeem(userId, code) {
  return call('/api/redeem', {
    method: 'POST',
    data: { userId, code }
  });
}

function fetchLevels(userId, dialect) {
  return call('/api/levels', { data: { userId, dialect } });
}

function fetchLessons(userId, dialect, levelId) {
  return call('/api/lessons', { data: { userId, dialect, levelId } });
}

function saveProgressScore(userId, dialect, itemId, score) {
  return call('/api/progress/score', {
    method: 'POST',
    data: { userId, dialect, itemId, score }
  });
}

function fetchWeakness(userId, dialect) {
  return call('/api/weakness', { data: { userId, dialect } });
}

module.exports = {
  checkHealth,
  fetchPublicConfig,
  fetchCatalog,
  fetchTrial,
  createAnonymousUser,
  fetchUserState,
  updateDialect,
  redeem,
  fetchLevels,
  fetchLessons,
  saveProgressScore,
  fetchWeakness
};
