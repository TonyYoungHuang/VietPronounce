const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '..', 'reports');
const MISSING_AUDIO_PATH = path.join(REPORT_DIR, 'missing-audio-manifest.json');
const OUTPUT_JSON = path.join(REPORT_DIR, 'audio-upload-manifest.json');
const OUTPUT_CSV = path.join(REPORT_DIR, 'audio-tts-script.csv');

const VOICE_BY_DIALECT = {
  north: 'vi-VN-NamMinhNeural',
  south: 'vi-VN-HoaiMyNeural'
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function csvEscape(value) {
  const stringValue = String(value ?? '');
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function getRelativeAssetPath(expectedPath) {
  return String(expectedPath || '').replace(/^\/assets\/audio\//, '');
}

function buildSsml(row) {
  const voice = VOICE_BY_DIALECT[row.dialect] || VOICE_BY_DIALECT.north;
  const rate = row.mode === 'slow' ? '-20%' : '0%';
  return [
    '<speak version="1.0" xml:lang="vi-VN">',
    `  <voice name="${voice}">`,
    `    <prosody rate="${rate}">${xmlEscape(row.text)}</prosody>`,
    '  </voice>',
    '</speak>'
  ].join('\n');
}

function buildAudioRows(missingAudio) {
  return missingAudio.map((entry, index) => {
    const voiceSuggestion = VOICE_BY_DIALECT[entry.dialect] || VOICE_BY_DIALECT.north;
    return {
      id: `audio-${String(index + 1).padStart(3, '0')}`,
      dialect: entry.dialect,
      locale: 'vi-VN',
      voiceSuggestion,
      levelId: entry.levelId,
      lessonId: entry.lessonId,
      itemId: entry.itemId,
      scope: entry.scope,
      mode: entry.mode,
      speakingRate: entry.mode === 'slow' ? '-20%' : '0%',
      text: entry.text,
      itemText: entry.itemText || entry.text,
      expectedPath: entry.expectedPath,
      stagingPath: getRelativeAssetPath(entry.expectedPath),
      ssml: buildSsml(entry)
    };
  });
}

function writeCsv(rows) {
  const columns = [
    'id',
    'dialect',
    'locale',
    'voiceSuggestion',
    'levelId',
    'lessonId',
    'itemId',
    'scope',
    'mode',
    'speakingRate',
    'text',
    'itemText',
    'expectedPath',
    'stagingPath',
    'ssml'
  ];
  const lines = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))
  ];
  fs.writeFileSync(OUTPUT_CSV, `${lines.join('\n')}\n`, 'utf8');
}

function run() {
  if (!fs.existsSync(MISSING_AUDIO_PATH)) {
    throw new Error('Missing audio manifest not found. Run npm run check first.');
  }
  ensureReportDir();
  const missingAudio = readJson(MISSING_AUDIO_PATH);
  const rows = buildAudioRows(missingAudio);
  const payload = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    source: 'backend/reports/missing-audio-manifest.json',
    stagingRoot: 'backend/audio-staging',
    targetRoot: 'assets/audio',
    notes: [
      'Use this manifest for TTS generation or external recording handoff.',
      'Place produced files under backend/audio-staging using stagingPath, then run npm run audio:import.',
      'Voice suggestions are placeholders; verify Vietnamese dialect quality before release.'
    ],
    items: rows
  };
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeCsv(rows);
  console.log(`Audio production pack generated. Items: ${rows.length}`);
  console.log(`JSON: ${OUTPUT_JSON}`);
  console.log(`CSV: ${OUTPUT_CSV}`);
}

run();
