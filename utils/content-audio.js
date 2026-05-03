const { DIALECTS } = require('../data/content-standard');

const AUDIO_ROOT = '/assets/audio';

function normalizeDialect(dialect) {
  return DIALECTS.includes(dialect) ? dialect : 'north';
}

function getDialectFallbackAudio(dialect) {
  return `${AUDIO_ROOT}/${normalizeDialect(dialect)}-demo.wav`;
}

function isGenericDemoAudio(value) {
  return /\/assets\/audio\/(north|south|thai|malay|indo|tagalog|hindi|tamil)-demo\.wav$/.test(String(value || ''));
}

function buildItemAudioPath(dialect, itemId, mode = 'normal') {
  const normalizedMode = mode === 'slow' ? 'slow' : 'normal';
  return `${AUDIO_ROOT}/${normalizeDialect(dialect)}/${normalizedMode}/${itemId}.mp3`;
}

function buildSegmentAudioPath(dialect, itemId, index, mode = 'normal') {
  const normalizedMode = mode === 'slow' ? 'slow' : 'normal';
  return `${AUDIO_ROOT}/${normalizeDialect(dialect)}/${normalizedMode}/${itemId}-seg-${index + 1}.mp3`;
}

function normalizeSegmentAudio(segment, dialect, item, index) {
  const fallbackDemoAudio = segment.fallbackDemoAudio || item.fallbackDemoAudio || item.demoAudio || getDialectFallbackAudio(dialect);
  return {
    ...segment,
    demoAudio: segment.demoAudio && !isGenericDemoAudio(segment.demoAudio)
      ? segment.demoAudio
      : buildSegmentAudioPath(dialect, item.id, index),
    slowDemoAudio: segment.slowDemoAudio || buildSegmentAudioPath(dialect, item.id, index, 'slow'),
    fallbackDemoAudio
  };
}

function normalizeItemAudio(item, dialect) {
  if (!item || !item.id) return item;
  const fallbackDemoAudio = item.fallbackDemoAudio || item.demoAudio || getDialectFallbackAudio(dialect);
  const next = {
    ...item,
    demoAudio: item.demoAudio && !isGenericDemoAudio(item.demoAudio)
      ? item.demoAudio
      : buildItemAudioPath(dialect, item.id),
    slowDemoAudio: item.slowDemoAudio || buildItemAudioPath(dialect, item.id, 'slow'),
    fallbackDemoAudio,
    demoAudioDialect: normalizeDialect(dialect)
  };
  next.segments = Array.isArray(item.segments)
    ? item.segments.map((segment, index) => normalizeSegmentAudio(segment, dialect, next, index))
    : [];
  return next;
}

function prepareGuidedSegments(item) {
  const segments = Array.isArray(item && item.segments) && item.segments.length
    ? item.segments
    : [{ text: item && item.text, tip: item && item.hint }];

  return segments.map((segment, index) => ({
    ...segment,
    index,
    label: String(index + 1).padStart(2, '0'),
    text: segment.text || '',
    tip: segment.tip || '先听范读，再模仿这一段的声调和收尾。',
    demoAudio: segment.demoAudio || (item && item.demoAudio),
    slowDemoAudio: segment.slowDemoAudio || (item && item.slowDemoAudio) || segment.demoAudio || (item && item.demoAudio),
    fallbackDemoAudio: segment.fallbackDemoAudio || (item && item.fallbackDemoAudio) || (item && item.demoAudio)
  }));
}

module.exports = {
  getDialectFallbackAudio,
  isGenericDemoAudio,
  buildItemAudioPath,
  buildSegmentAudioPath,
  normalizeItemAudio,
  prepareGuidedSegments
};
