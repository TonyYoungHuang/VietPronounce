const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { buildVietnameseDimensions } = require('../../utils/pronunciation-dimensions');

const AZURE_STT_PATH = '/speech/recognition/conversation/cognitiveservices/v1';

function clampScore(value, fallback = 0) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isAzurePronunciationConfigured() {
  return process.env.AZURE_SPEECH_DISABLED !== 'true'
    && Boolean(process.env.AZURE_SPEECH_KEY)
    && (Boolean(process.env.AZURE_SPEECH_ENDPOINT) || Boolean(process.env.AZURE_SPEECH_REGION));
}

function trimTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getAzureSttEndpoint() {
  const region = process.env.AZURE_SPEECH_REGION;
  const explicitSttEndpoint = trimTrailingSlash(process.env.AZURE_SPEECH_STT_ENDPOINT);
  if (explicitSttEndpoint) {
    return explicitSttEndpoint.includes('/speech/recognition/') ? explicitSttEndpoint : `${explicitSttEndpoint}${AZURE_STT_PATH}`;
  }
  const endpoint = trimTrailingSlash(process.env.AZURE_SPEECH_ENDPOINT);
  if (endpoint) {
    if (endpoint.includes('.api.cognitive.microsoft.com') && region) {
      return `https://${region}.stt.speech.microsoft.com${AZURE_STT_PATH}`;
    }
    return endpoint.includes('/speech/recognition/') ? endpoint : `${endpoint}${AZURE_STT_PATH}`;
  }
  return `https://${region}.stt.speech.microsoft.com${AZURE_STT_PATH}`;
}

function getLanguage(fields) {
  return fields.language || fields.locale || 'vi-VN';
}

function getAudioExtension(audio) {
  const filename = String(audio.filename || '').toLowerCase();
  if (filename.endsWith('.wav')) return 'wav';
  if (filename.endsWith('.aac')) return 'aac';
  if (filename.endsWith('.m4a')) return 'm4a';
  if (filename.endsWith('.ogg')) return 'ogg';
  if (String(audio.contentType || '').includes('wav')) return 'wav';
  if (String(audio.contentType || '').includes('aac')) return 'aac';
  if (String(audio.contentType || '').includes('ogg')) return 'ogg';
  return 'mp3';
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(createHttpError(500, '音频转换组件未安装，暂时无法调用真实评分。'));
      return;
    }
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(createHttpError(422, `录音格式无法转换，请重新录制后再试。${stderr ? ` ${stderr.slice(0, 160)}` : ''}`));
    });
  });
}

async function convertToAzureWav(audio) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `pronunciation-${id}-input.${getAudioExtension(audio)}`);
  const outputPath = path.join(os.tmpdir(), `pronunciation-${id}-azure.wav`);
  await fs.promises.writeFile(inputPath, audio.buffer);
  try {
    await runFfmpeg([
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      inputPath,
      '-ac',
      '1',
      '-ar',
      '16000',
      '-acodec',
      'pcm_s16le',
      '-f',
      'wav',
      outputPath
    ]);
    return await fs.promises.readFile(outputPath);
  } finally {
    await fs.promises.unlink(inputPath).catch(() => {});
    await fs.promises.unlink(outputPath).catch(() => {});
  }
}

function buildPronunciationHeader(referenceText) {
  const params = {
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Word',
    Dimension: 'Comprehensive',
    EnableMiscue: 'True',
    EnableProsodyAssessment: 'True'
  };
  return Buffer.from(JSON.stringify(params), 'utf8').toString('base64');
}

function normalizeWord(value) {
  return String(value || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function buildIssueIndices(words, item) {
  const segments = Array.isArray(item.segments) ? item.segments : [];
  const segmentIndexByWord = segments.reduce((map, segment, index) => {
    map.set(normalizeWord(segment.text), index);
    return map;
  }, new Map());
  const issueSet = new Set();
  words.forEach((word, wordIndex) => {
    const score = Number(word.AccuracyScore);
    const errorType = String(word.ErrorType || 'None');
    if (errorType === 'None' && (!Number.isFinite(score) || score >= 72)) return;
    const mappedIndex = segmentIndexByWord.get(normalizeWord(word.Word));
    issueSet.add(Number.isInteger(mappedIndex) ? mappedIndex : wordIndex);
  });
  return Array.from(issueSet).filter((index) => index >= 0 && index < Math.max(segments.length, words.length));
}

function buildAzureDimensions(best, baseline, issueIndices) {
  const base = buildVietnameseDimensions({
    dialect: baseline.dialect,
    item: baseline.item,
    issueIndices,
    accuracy: best.AccuracyScore,
    completeness: best.CompletenessScore,
    fluency: best.FluencyScore
  });
  const worstWord = (best.Words || [])
    .filter((word) => String(word.ErrorType || 'None') !== 'None' || Number(word.AccuracyScore) < 72)
    .sort((a, b) => Number(a.AccuracyScore || 0) - Number(b.AccuracyScore || 0))[0];
  if (!worstWord) return base;
  return base.map((dimension) => {
    if (dimension.key === 'tone') {
      return {
        ...dimension,
        focus: worstWord.Word || dimension.focus,
        tip: `${worstWord.Word || dimension.focus} 的声调和音高走势需要更清楚，先慢读，再保留调值变化。`
      };
    }
    if (dimension.key === 'rhythm' && Number.isFinite(Number(best.ProsodyScore))) {
      return {
        ...dimension,
        score: clampScore(best.ProsodyScore, dimension.score),
        tip: '节奏和停顿会影响自然度，跟读时保持每个音节短促、清晰、不断开。'
      };
    }
    return dimension;
  });
}

async function scoreWithAzurePronunciation(fields, audio, baseline) {
  if (!isAzurePronunciationConfigured()) return null;
  const referenceText = fields.text || fields.transcript || baseline.item.text;
  if (!referenceText) {
    throw createHttpError(400, '缺少评分文本，无法调用 Azure 发音评估。');
  }

  const wavBuffer = await convertToAzureWav(audio);
  const url = new URL(getAzureSttEndpoint());
  url.searchParams.set('language', getLanguage(fields));
  url.searchParams.set('format', 'detailed');
  url.searchParams.set('profanity', 'raw');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'Pronunciation-Assessment': buildPronunciationHeader(referenceText)
    },
    body: wavBuffer
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw createHttpError(502, `Azure 评分服务返回了无法解析的数据：${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw createHttpError(502, payload.message || payload.error?.message || `Azure 评分服务不可用：HTTP ${response.status}`);
  }
  if (payload.RecognitionStatus !== 'Success') {
    throw createHttpError(422, `Azure 未识别到有效发音：${payload.RecognitionStatus || 'NoMatch'}`);
  }

  const best = (payload.NBest && payload.NBest[0]) || {};
  const issueIndices = buildIssueIndices(best.Words || [], baseline.item);
  const total = clampScore(best.PronScore, baseline.total);
  const normalized = {
    total,
    accuracy: clampScore(best.AccuracyScore, baseline.accuracy),
    completeness: clampScore(best.CompletenessScore, baseline.completeness),
    fluency: clampScore(best.FluencyScore, baseline.fluency),
    prosody: clampScore(best.ProsodyScore, baseline.fluency),
    passed: total >= 78,
    issueIndices,
    durationMs: baseline.durationMs,
    dialect: baseline.dialect,
    item: baseline.item,
    transcript: best.Display || payload.DisplayText || '',
    audioQuality: baseline.audioQuality,
    provider: process.env.SCORE_PROVIDER_NAME || 'azure-pronunciation',
    scoreSource: process.env.SCORE_PROVIDER_NAME || 'azure-pronunciation',
    rawScoreData: payload
  };
  return {
    ...normalized,
    pronunciationDimensions: buildAzureDimensions(best, baseline, issueIndices)
  };
}

module.exports = {
  getAzureSttEndpoint,
  isAzurePronunciationConfigured,
  scoreWithAzurePronunciation
};
