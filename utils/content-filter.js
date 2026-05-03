const { normalizeItemAudio } = require('./content-audio');
const { DIALECTS } = require('../data/content-standard');

const PLACEHOLDER_MARK = '\u5f85\u8865\u5145';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasPlaceholder(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.includes(PLACEHOLDER_MARK);
  if (Array.isArray(value)) return value.some((item) => hasPlaceholder(item));
  if (typeof value === 'object') return Object.values(value).some((item) => hasPlaceholder(item));
  return false;
}

function isPublishableItem(item) {
  return item && !hasPlaceholder(item);
}

function filterCatalogForRelease(catalog) {
  const next = clone(catalog);
  DIALECTS.forEach((dialect) => {
    if (!next[dialect] || !Array.isArray(next[dialect].levels)) return;
    next[dialect].levels = next[dialect].levels.map((level) => ({
      ...level,
      lessons: (level.lessons || [])
        .map((lesson) => ({
          ...lesson,
          items: (lesson.items || [])
            .filter(isPublishableItem)
            .map((item) => normalizeItemAudio(item, dialect))
        }))
        .filter((lesson) => lesson.items.length > 0)
    }));
  });
  return next;
}

function filterTrialForRelease(trialItems) {
  const next = clone(trialItems);
  DIALECTS.forEach((dialect) => {
    if (next[dialect] && isPublishableItem(next[dialect])) {
      next[dialect] = normalizeItemAudio(next[dialect], dialect);
    }
  });
  return next;
}

module.exports = {
  PLACEHOLDER_MARK,
  hasPlaceholder,
  isPublishableItem,
  filterCatalogForRelease,
  filterTrialForRelease
};
