const { getScoreApiConfig } = require('../config/index');
const { buildUrl, uploadFile } = require('./request');
const { scoreRecording } = require('../utils/engine');

function parsePayload(raw) {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { message: raw };
    }
  }
  return raw || {};
}

function getByPath(source, path) {
  if (!path) return source;
  return String(path)
    .split('.')
    .filter(Boolean)
    .reduce((current, key) => (current == null ? undefined : current[key]), source);
}

function getMappedValue(source, mapping, fallbackKey) {
  if (mapping && Object.prototype.hasOwnProperty.call(mapping, fallbackKey)) {
    return getByPath(source, mapping[fallbackKey]);
  }
  return source ? source[fallbackKey] : undefined;
}

function normalizeIssueIndices(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((index) => Number.isInteger(index) && index >= 0);
}

function toBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

function buildHeaders(config) {
  const headers = { ...(config.headers || {}) };
  const auth = config.auth || {};
  if (auth.type === 'bearer' && auth.token) {
    headers[auth.headerName || 'Authorization'] = `${auth.prefix || 'Bearer '}${auth.token}`;
  }
  if (auth.type === 'apiKey' && auth.token) {
    headers[auth.headerName || 'x-api-key'] = auth.token;
  }
  return headers;
}

function buildRequestFormData(context, options, config) {
  const mapping = config.requestMapping || {};
  const fields = mapping.fields || {};
  const dialectValues = mapping.dialectValues || {};
  const itemTypeValues = mapping.itemTypeValues || {};
  const item = context.item || {};

  const payload = {
    ...(mapping.staticParams || {})
  };

  const values = {
    dialect: dialectValues[context.dialect] || context.dialect,
    itemId: item.id,
    transcript: item.text,
    itemType: itemTypeValues[item.type] || item.type,
    lessonId: item.lessonId,
    levelId: item.levelId,
    durationMs: options.durationMs || 0,
    attemptCount: context.attemptCount || 1
  };

  Object.keys(values).forEach((key) => {
    const fieldName = fields[key];
    if (!fieldName) return;
    if (values[key] === undefined || values[key] === null || values[key] === '') return;
    payload[fieldName] = values[key];
  });

  return payload;
}

function normalizeScorePayload(payload, config) {
  const responseMapping = config.responseMapping || {};
  const source = getByPath(payload, responseMapping.root) || payload;

  const total = Number(getMappedValue(source, responseMapping, 'total'));
  const completeness = Number(getMappedValue(source, responseMapping, 'completeness'));
  const accuracy = Number(getMappedValue(source, responseMapping, 'accuracy'));
  const fluency = Number(getMappedValue(source, responseMapping, 'fluency'));

  if ([total, completeness, accuracy, fluency].some((value) => Number.isNaN(value))) {
    throw new Error('评分接口返回结构不完整');
  }

  return {
    total,
    completeness,
    accuracy,
    fluency,
    passed: toBoolean(getMappedValue(source, responseMapping, 'passed'), total >= 78),
    issueIndices: normalizeIssueIndices(getMappedValue(source, responseMapping, 'issueIndices')),
    durationMs: Number(getMappedValue(source, responseMapping, 'durationMs') || 0),
    rawScoreData: payload
  };
}

async function requestRemoteScore(context, options) {
  const config = getScoreApiConfig();
  const requestMapping = config.requestMapping || {};
  const fileFieldName = requestMapping.fileFieldName || config.fileFieldName || 'audio';

  if (!config.baseUrl) {
    throw new Error('未配置评分服务地址');
  }
  if (!options.audioFilePath) {
    throw new Error('缺少录音文件');
  }

  const response = await uploadFile({
    url: buildUrl(config.baseUrl, config.scorePath),
    filePath: options.audioFilePath,
    name: fileFieldName,
    timeout: config.timeout,
    header: buildHeaders(config),
    formData: buildRequestFormData(context, options, config)
  });

  const payload = parsePayload(response.data);
  const messagePath = (config.responseMapping || {}).message;
  const responseMessage = messagePath ? getByPath(payload, messagePath) : payload.message;
  if (!response || response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(responseMessage || `评分接口错误：${response.statusCode}`);
  }
  if (payload && payload.ok === false) {
    throw new Error(responseMessage || '评分接口返回结构不完整');
  }

  return {
    ...normalizeScorePayload(payload, config),
    scoreSource: config.provider || 'remote'
  };
}

function buildMockScore(context, options) {
  return {
    ...scoreRecording(context.item, options.durationMs || 2000, context.attemptCount || 1),
    scoreSource: 'mock',
    rawScoreData: null
  };
}

async function scoreFixedContent(context, options = {}) {
  const config = getScoreApiConfig();
  const prefersRemote = config.mode === 'remote';
  if (!prefersRemote) {
    return buildMockScore(context, options);
  }

  try {
    return await requestRemoteScore(context, options);
  } catch (error) {
    if (!config.useMockFallback) {
      throw error;
    }
    return buildMockScore(context, options);
  }
}

module.exports = {
  scoreFixedContent,
  normalizeScorePayload,
  buildRequestFormData
};
