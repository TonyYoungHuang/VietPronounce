const crypto = require('crypto');
const { getLanguageMeta, normalizeDialect } = require('../../data/content-standard');
const fs = require('fs');
const path = require('path');

const TTS_PATH = '/cognitiveservices/v1';
const CACHE_DIR = path.join(__dirname, '..', 'storage', 'tts-cache');

const VOICE_BY_DIALECT = {
  north: 'vi-VN-NamMinhNeural',
  south: 'vi-VN-HoaiMyNeural',
  thai: 'th-TH-PremwadeeNeural',
  malay: 'ms-MY-YasminNeural',
  indo: 'id-ID-GadisNeural',
  tagalog: 'fil-PH-BlessicaNeural',
  hindi: 'hi-IN-SwaraNeural',
  tamil: 'ta-IN-PallaviNeural'
};

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function trimTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getAzureTtsEndpoint() {
  const explicit = trimTrailingSlash(process.env.AZURE_SPEECH_TTS_ENDPOINT);
  if (explicit) return explicit.includes(TTS_PATH) ? explicit : `${explicit}${TTS_PATH}`;
  const region = process.env.AZURE_SPEECH_REGION;
  if (region) return `https://${region}.tts.speech.microsoft.com${TTS_PATH}`;
  const endpoint = trimTrailingSlash(process.env.AZURE_SPEECH_ENDPOINT);
  return endpoint ? `${endpoint}${TTS_PATH}` : '';
}

function isAzureTtsConfigured() {
  return process.env.AZURE_SPEECH_DISABLED !== 'true'
    && Boolean(process.env.AZURE_SPEECH_KEY)
    && Boolean(getAzureTtsEndpoint());
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSsml({ text, dialect, mode }) {
  const normalizedDialect = normalizeDialect(dialect);
  const languageMeta = getLanguageMeta(normalizedDialect);
  const voice = VOICE_BY_DIALECT[normalizedDialect];
  const rate = mode === 'slow' ? '-20%' : '0%';
  return [
    `<speak version="1.0" xml:lang="${languageMeta.locale}">`,
    `  <voice name="${voice}">`,
    `    <prosody rate="${rate}">${xmlEscape(text)}</prosody>`,
    '  </voice>',
    '</speak>'
  ].join('\n');
}

function getCachePath(params) {
  const hash = crypto
    .createHash('sha1')
    .update(JSON.stringify(params))
    .digest('hex');
  return path.join(CACHE_DIR, `${hash}.mp3`);
}

async function synthesizeDemoAudio(params) {
  const text = String(params.text || '').trim();
  if (!text) throw createHttpError(400, '缺少范读文本');
  if (!isAzureTtsConfigured()) throw createHttpError(503, '范读服务暂时不可用');

  const normalized = {
    text: text.slice(0, 160),
    dialect: normalizeDialect(params.dialect),
    mode: params.mode === 'slow' ? 'slow' : 'normal'
  };
  const cachePath = getCachePath(normalized);
  if (fs.existsSync(cachePath)) {
    return fs.promises.readFile(cachePath);
  }

  const response = await fetch(getAzureTtsEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'X-Microsoft-OutputFormat': process.env.AZURE_TTS_OUTPUT_FORMAT || 'audio-16khz-32kbitrate-mono-mp3',
      'User-Agent': 'vietnamese-pronunciation-coach'
    },
    body: buildSsml(normalized)
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    throw createHttpError(502, `范读服务暂时不可用：HTTP ${response.status}`);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  await fs.promises.writeFile(cachePath, buffer);
  return buffer;
}

module.exports = {
  getAzureTtsEndpoint,
  isAzureTtsConfigured,
  synthesizeDemoAudio
};
