const fs = require('fs');
const path = require('path');
const { loadBackendEnv } = require('../src/env');

loadBackendEnv();

const REPORT_DIR = path.join(__dirname, '..', 'reports');
const MANIFEST_PATH = path.join(REPORT_DIR, 'audio-upload-manifest.json');
const REPORT_PATH = path.join(REPORT_DIR, 'azure-tts-report.json');
const DEFAULT_STAGING_ROOT = path.join(__dirname, '..', 'audio-staging');
const TTS_PATH = '/cognitiveservices/v1';

function trimTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getTtsEndpoint() {
  const explicit = trimTrailingSlash(process.env.AZURE_SPEECH_TTS_ENDPOINT);
  if (explicit) return explicit.includes(TTS_PATH) ? explicit : `${explicit}${TTS_PATH}`;
  const endpoint = trimTrailingSlash(process.env.AZURE_SPEECH_ENDPOINT);
  if (endpoint) return endpoint.includes(TTS_PATH) ? endpoint : `${endpoint}${TTS_PATH}`;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!region) return '';
  return `https://${region}.tts.speech.microsoft.com${TTS_PATH}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesize(item, endpoint, targetPath) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'X-Microsoft-OutputFormat': process.env.AZURE_TTS_OUTPUT_FORMAT || 'audio-16khz-32kbitrate-mono-mp3',
      'User-Agent': 'vietnamese-pronunciation-coach'
    },
    body: item.ssml
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    throw new Error(`Azure TTS failed for ${item.id}: HTTP ${response.status} ${buffer.toString('utf8').slice(0, 200)}`);
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buffer);
}

async function run() {
  if (process.env.AZURE_TTS_CONFIRM !== 'true') {
    throw new Error('Set AZURE_TTS_CONFIRM=true to generate audio and consume Azure Speech quota.');
  }
  if (!process.env.AZURE_SPEECH_KEY) {
    throw new Error('AZURE_SPEECH_KEY is required.');
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('Audio upload manifest not found. Run npm run audio:pack first.');
  }
  const endpoint = getTtsEndpoint();
  if (!endpoint) {
    throw new Error('AZURE_SPEECH_ENDPOINT or AZURE_SPEECH_REGION is required.');
  }

  const stagingRoot = path.resolve(process.env.AUDIO_STAGING_DIR || DEFAULT_STAGING_ROOT);
  const manifest = readJson(MANIFEST_PATH);
  const limit = Number(process.env.AUDIO_TTS_LIMIT || 0);
  const force = process.env.AUDIO_TTS_FORCE === 'true';
  const items = limit > 0 ? manifest.items.slice(0, limit) : manifest.items;
  const generated = [];
  const skipped = [];
  const failed = [];

  for (const item of items) {
    const targetPath = path.join(stagingRoot, item.stagingPath);
    if (!force && fs.existsSync(targetPath)) {
      skipped.push({ id: item.id, targetPath });
      continue;
    }
    try {
      await synthesize(item, endpoint, targetPath);
      generated.push({ id: item.id, targetPath });
      await sleep(Number(process.env.AZURE_TTS_DELAY_MS || 120));
    } catch (error) {
      failed.push({ id: item.id, message: error.message });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    endpoint,
    stagingRoot,
    requested: items.length,
    generated: generated.length,
    skipped: skipped.length,
    failed: failed.length,
    generatedItems: generated,
    skippedItems: skipped,
    failedItems: failed
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Azure TTS completed. Generated: ${generated.length}, skipped: ${skipped.length}, failed: ${failed.length}`);
  console.log(`Report: ${REPORT_PATH}`);
  if (failed.length) process.exitCode = 1;
}

run();
