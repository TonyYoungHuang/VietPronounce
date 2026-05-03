const { scoreRecording } = require('../../utils/engine');
const { buildVietnameseDimensions, normalizePronunciationDimensions } = require('../../utils/pronunciation-dimensions');
const { normalizeDialect } = require('../../data/content-standard');
const { assessAudioQuality } = require('./audio-quality');
const { getAzureSttEndpoint, isAzurePronunciationConfigured, scoreWithAzurePronunciation } = require('./azure-pronunciation');

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const SCORE_PROVIDER_URL = process.env.SCORE_PROVIDER_URL || '';
const SCORE_PROVIDER_AUTH_HEADER = process.env.SCORE_PROVIDER_AUTH_HEADER || 'Authorization';
const SCORE_PROVIDER_API_KEY = process.env.SCORE_PROVIDER_API_KEY || '';

function allowsBaselineFallback() {
  return process.env.SCORE_ALLOW_BASELINE_FALLBACK === 'true';
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseContentDisposition(value) {
  return String(value || '').split(';').reduce((accumulator, chunk) => {
    const [rawKey, ...rest] = chunk.trim().split('=');
    const key = rawKey && rawKey.trim().toLowerCase();
    if (!key) return accumulator;
    const rawValue = rest.join('=').trim();
    accumulator[key] = rawValue.replace(/^"|"$/g, '');
    return accumulator;
  }, {});
}

function splitMultipart(buffer, boundary) {
  const marker = Buffer.from(`--${boundary}`);
  const parts = [];
  let cursor = buffer.indexOf(marker);
  while (cursor !== -1) {
    const next = buffer.indexOf(marker, cursor + marker.length);
    if (next === -1) break;
    let part = buffer.subarray(cursor + marker.length, next);
    if (part.length >= 2 && part[0] === 13 && part[1] === 10) {
      part = part.subarray(2);
    }
    if (part.length >= 2 && part[part.length - 2] === 13 && part[part.length - 1] === 10) {
      part = part.subarray(0, part.length - 2);
    }
    if (part.length && String(part).trim() !== '--') {
      parts.push(part);
    }
    cursor = next;
  }
  return parts;
}

function parsePart(part) {
  const separator = Buffer.from('\r\n\r\n');
  const headerEnd = part.indexOf(separator);
  if (headerEnd === -1) return null;
  const rawHeaders = part.subarray(0, headerEnd).toString('utf8');
  const body = part.subarray(headerEnd + separator.length);
  const headers = rawHeaders.split('\r\n').reduce((accumulator, line) => {
    const index = line.indexOf(':');
    if (index === -1) return accumulator;
    accumulator[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
    return accumulator;
  }, {});
  const disposition = parseContentDisposition(headers['content-disposition']);
  if (!disposition.name) return null;
  return {
    name: disposition.name,
    filename: disposition.filename || '',
    contentType: headers['content-type'] || 'application/octet-stream',
    body
  };
}

function readRequestBuffer(req, maxBytes = MAX_AUDIO_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(createHttpError(413, '录音文件过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function parseMultipartRequest(req) {
  const contentType = req.headers['content-type'] || '';
  const boundary = /boundary=([^;]+)/i.exec(contentType)?.[1];
  if (!boundary) {
    throw createHttpError(400, '评分请求缺少录音上传边界');
  }

  const buffer = await readRequestBuffer(req);
  const fields = {};
  let audio = null;

  splitMultipart(buffer, boundary).forEach((rawPart) => {
    const part = parsePart(rawPart);
    if (!part) return;
    if (part.filename) {
      audio = {
        fieldName: part.name,
        filename: part.filename,
        contentType: part.contentType,
        buffer: part.body
      };
      return;
    }
    fields[part.name] = part.body.toString('utf8');
  });

  if (!audio || !audio.buffer.length) {
    throw createHttpError(400, '请先录音再提交评分');
  }

  return { fields, audio };
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function splitReferenceSegments(text) {
  const parts = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return [{ text: String(text || ''), tip: '保持发音完整，注意声调和尾音。' }];
  return parts.map((part) => ({
    text: part,
    tip: `重点检查 ${part} 的声调、元音口型和尾音收束。`
  }));
}

function buildBaselineScore(fields, audio) {
  const transcript = fields.text || fields.transcript || '';
  const item = {
    id: fields.itemId || transcript || `audio-${audio.buffer.length}`,
    type: fields.type || fields.itemType || 'sentence',
    text: transcript,
    segments: splitReferenceSegments(transcript)
  };
  const durationMs = toNumber(fields.durationMs, Math.max(1000, Math.round(audio.buffer.length / 16)));
  const attemptCount = Math.max(1, toNumber(fields.attemptCount, 1));
  const score = scoreRecording(item, durationMs, attemptCount);

  return {
    ...score,
    dialect: normalizeDialect(fields.dialect),
    item,
    durationMs,
    audioQuality: assessAudioQuality({
      durationMs,
      size: audio.buffer.length,
      itemType: item.type
    }),
    pronunciationDimensions: buildVietnameseDimensions({
      dialect: fields.dialect,
      item,
      ...score
    }),
    provider: 'backend-baseline',
    scoreSource: 'backend-baseline'
  };
}

function getByPath(source, path) {
  if (!path) return source;
  return String(path)
    .split('.')
    .filter(Boolean)
    .reduce((current, key) => (current == null ? undefined : current[key]), source);
}

function normalizeProviderScore(payload, fallback) {
  const source = getByPath(payload, process.env.SCORE_PROVIDER_RESPONSE_ROOT || '') || payload;
  const total = Number(source.total ?? source.overall ?? source.score);
  const accuracy = Number(source.accuracy ?? fallback.accuracy);
  const completeness = Number(source.completeness ?? source.integrity ?? fallback.completeness);
  const fluency = Number(source.fluency ?? fallback.fluency);
  if ([total, accuracy, completeness, fluency].some((value) => Number.isNaN(value))) {
    throw createHttpError(502, '评分服务返回数据不完整');
  }
  const normalized = {
    total,
    accuracy,
    completeness,
    fluency,
    passed: typeof source.passed === 'boolean' ? source.passed : total >= 78,
    issueIndices: Array.isArray(source.issueIndices || source.problemSegments) ? source.issueIndices || source.problemSegments : [],
    durationMs: Number(source.durationMs || source.audioDuration || fallback.durationMs || 0),
    provider: process.env.SCORE_PROVIDER_NAME || 'provider',
    scoreSource: process.env.SCORE_PROVIDER_NAME || 'provider',
    rawScoreData: payload,
    audioQuality: source.audioQuality || fallback.audioQuality
  };
  return {
    ...normalized,
    pronunciationDimensions: normalizePronunciationDimensions(source.pronunciationDimensions || source.dimensions, {
      dialect: fallback.dialect,
      item: fallback.item,
      ...normalized
    })
  };
}

async function requestProviderScore(fields, audio, fallback) {
  const azureScore = await scoreWithAzurePronunciation(fields, audio, fallback);
  if (azureScore) return azureScore;

  if (!SCORE_PROVIDER_URL) return null;

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append('audio', new Blob([audio.buffer], { type: audio.contentType }), audio.filename || 'recording.mp3');

  const headers = {};
  if (SCORE_PROVIDER_API_KEY) {
    headers[SCORE_PROVIDER_AUTH_HEADER] = SCORE_PROVIDER_AUTH_HEADER.toLowerCase() === 'authorization'
      ? `Bearer ${SCORE_PROVIDER_API_KEY}`
      : SCORE_PROVIDER_API_KEY;
  }

  const response = await fetch(SCORE_PROVIDER_URL, {
    method: 'POST',
    headers,
    body: formData
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw createHttpError(502, payload.message || '评分服务暂时不可用');
  }
  return normalizeProviderScore(payload, fallback);
}

async function scoreUpload(req) {
  const { fields, audio } = await parseMultipartRequest(req);
  const baseline = buildBaselineScore(fields, audio);
  const quality = assessAudioQuality({
    durationMs: baseline.durationMs,
    size: audio.buffer.length,
    itemType: fields.type || fields.itemType
  });
  if (!quality.ok) {
    throw createHttpError(422, quality.message);
  }
  const providerScore = await requestProviderScore(fields, audio, baseline);
  if (!providerScore && !allowsBaselineFallback()) {
    throw createHttpError(503, '真实语音评分服务未配置，暂不能返回基准分。请配置 SCORE_PROVIDER_URL，或仅在本地检查时启用 SCORE_ALLOW_BASELINE_FALLBACK=true。');
  }
  return {
    score: providerScore || baseline
  };
}

module.exports = {
  buildBaselineScore,
  getAzureSttEndpoint,
  isAzurePronunciationConfigured,
  parseMultipartRequest,
  scoreUpload
};
