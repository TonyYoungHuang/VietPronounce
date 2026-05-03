const appApi = require('../services/app-api');
const store = require('./store');
const { hasPlaceholder } = require('./content-filter');
const { getActiveEnv, getAppApiConfig, getScoreApiConfig } = require('../config/index');

let latestStatus = null;

function getLocalContentStatus() {
  const catalog = store.catalog;
  const trialItems = store.trialItems;
  return {
    ok: !hasPlaceholder(catalog) && !hasPlaceholder(trialItems),
    hasPlaceholder: hasPlaceholder(catalog) || hasPlaceholder(trialItems)
  };
}

async function runStartupHealthCheck() {
  const appConfig = getAppApiConfig();
  const scoreConfig = getScoreApiConfig();
  const content = getLocalContentStatus();
  const status = {
    ok: true,
    environment: getActiveEnv(),
    appApiBaseUrl: appConfig.baseUrl,
    scoreApiBaseUrl: scoreConfig.baseUrl,
    backendReachable: false,
    scoreProviderConfigured: false,
    contentOk: content.ok,
    issues: [],
    checkedAt: new Date().toISOString()
  };

  if (!appConfig.baseUrl) {
    status.issues.push('生产服务地址尚未配置');
  }
  if (!scoreConfig.baseUrl) {
    status.issues.push('评分服务地址尚未配置');
  }
  if (!content.ok) {
    status.issues.push('发布内容仍包含占位项');
  }

  try {
    const health = await appApi.checkHealth();
    status.backendReachable = true;
    status.scoreProviderConfigured = Boolean(health.scoreProviderConfigured || (health.scoring && health.scoring.providerConfigured));
    if (!status.scoreProviderConfigured && status.environment === 'production') {
      status.issues.push('真实评分服务尚未配置');
    }
  } catch (error) {
    status.backendReachable = false;
    status.issues.push('服务暂时不可访问');
  }

  status.ok = status.issues.length === 0;
  latestStatus = status;
  return status;
}

function getLatestStartupStatus() {
  return latestStatus;
}

async function ensureServiceReadyForScoring() {
  const status = latestStatus || await runStartupHealthCheck();
  if (!status.backendReachable) {
    return { ok: false, message: '服务正在维护，请稍后再试。' };
  }
  if (!status.contentOk) {
    return { ok: false, message: '课程内容正在更新，请稍后再试。' };
  }
  if (status.environment === 'production' && !status.scoreProviderConfigured) {
    return { ok: false, message: '发音评分服务正在配置，请稍后再试。' };
  }
  return { ok: true, status };
}

module.exports = {
  runStartupHealthCheck,
  getLatestStartupStatus,
  ensureServiceReadyForScoring
};
