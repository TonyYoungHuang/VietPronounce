const fs = require('fs');
const path = require('path');
const { catalog, trialItems } = require('../../data/mock');
const { filterCatalogForRelease, filterTrialForRelease, hasPlaceholder } = require('../../utils/content-filter');
const { isGenericDemoAudio } = require('../../utils/content-audio');
const { assertCatalogShape, assertTrialShape } = require('../../utils/content-validate');
const { DIALECTS, stripDialectPrefix } = require('../../data/content-standard');

const REPO_ROOT = path.join(__dirname, '..', '..');
const REPORT_DIR = path.join(__dirname, '..', 'reports');
const MIN_ITEMS_PER_LESSON = Number(process.env.RELEASE_MIN_ITEMS_PER_LESSON || 1);

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function resolveAssetPath(assetPath) {
  if (!assetPath || !String(assetPath).startsWith('/assets/')) return '';
  return path.join(REPO_ROOT, String(assetPath).replace(/^\//, ''));
}

function collectLessons(catalogValue) {
  const lessons = [];
  DIALECTS.forEach((dialect) => {
    if (!catalogValue[dialect]) return;
    catalogValue[dialect].levels.forEach((level) => {
      level.lessons.forEach((lesson) => {
        lessons.push({ dialect, levelId: level.id, lesson });
      });
    });
  });
  return lessons;
}

function collectItems(catalogValue) {
  return collectLessons(catalogValue).flatMap(({ dialect, levelId, lesson }) =>
    lesson.items.map((item) => ({ dialect, levelId, lessonId: lesson.id, item }))
  );
}

function collectAudioRefsForItem(entry) {
  const refs = [
    { scope: 'item', mode: 'normal', path: entry.item.demoAudio, text: entry.item.text },
    { scope: 'item', mode: 'slow', path: entry.item.slowDemoAudio, text: entry.item.text }
  ];
  (entry.item.segments || []).forEach((segment, index) => {
    refs.push({ scope: `segment-${index + 1}`, mode: 'normal', path: segment.demoAudio, text: segment.text });
    refs.push({ scope: `segment-${index + 1}`, mode: 'slow', path: segment.slowDemoAudio, text: segment.text });
  });
  return refs.filter((ref) => ref.path);
}

function assertReleaseItemAudio(entry) {
  const { dialect, item } = entry;
  if (hasPlaceholder(item)) {
    throw new Error(`发布内容仍包含占位项：${item.id}`);
  }
  if (isGenericDemoAudio(item.demoAudio)) {
    throw new Error(`发布内容仍共用通用范读：${item.id}`);
  }
  if (!String(item.demoAudio || '').includes(`/assets/audio/${dialect}/normal/`)) {
    throw new Error(`范读路径未按方言规范生成：${item.id}`);
  }
  if (!String(item.slowDemoAudio || '').includes(`/assets/audio/${dialect}/slow/`)) {
    throw new Error(`慢速范读路径未按方言规范生成：${item.id}`);
  }
}

function assertLessonThresholds(catalogValue) {
  collectLessons(catalogValue).forEach(({ dialect, lesson }) => {
    if ((lesson.items || []).length < MIN_ITEMS_PER_LESSON) {
      throw new Error(`${dialect} / ${lesson.id} 可练题数量不足 ${MIN_ITEMS_PER_LESSON}`);
    }
  });
}

function assertMirrorConsistency(catalogValue) {
  catalogValue.north.levels.forEach((northLevel, levelIndex) => {
    const southLevel = catalogValue.south.levels[levelIndex];
    if (!southLevel || northLevel.id !== southLevel.id) {
      throw new Error(`北越/南越等级镜像不一致：${northLevel.id}`);
    }
    northLevel.lessons.forEach((northLesson, lessonIndex) => {
      const southLesson = southLevel.lessons[lessonIndex];
      if (!southLesson || stripDialectPrefix(northLesson.id) !== stripDialectPrefix(southLesson.id)) {
        throw new Error(`北越/南越章节镜像不一致：${northLesson.id}`);
      }
      if (northLesson.items.length !== southLesson.items.length) {
        throw new Error(`北越/南越题目数量不一致：${northLesson.id}`);
      }
      northLesson.items.forEach((northItem, itemIndex) => {
        const southItem = southLesson.items[itemIndex];
        if (!southItem || northItem.type !== southItem.type || stripDialectPrefix(northItem.id) !== stripDialectPrefix(southItem.id)) {
          throw new Error(`北越/南越题目镜像不一致：${northItem.id}`);
        }
      });
    });
  });
}

function buildSummary(catalogValue, trialValue) {
  const summary = {
    generatedAt: new Date().toISOString(),
    minItemsPerLesson: MIN_ITEMS_PER_LESSON,
    dialects: {},
    trial: {}
  };

  DIALECTS.forEach((dialect) => {
    if (!catalogValue[dialect] || !trialValue[dialect]) return;
    const levels = catalogValue[dialect].levels;
    const lessons = levels.flatMap((level) => level.lessons);
    const items = lessons.flatMap((lesson) => lesson.items);
    summary.dialects[dialect] = {
      levels: levels.length,
      lessons: lessons.length,
      items: items.length,
      syllables: items.filter((item) => item.type === 'syllable').length,
      words: items.filter((item) => item.type === 'word').length,
      sentences: items.filter((item) => item.type === 'sentence').length
    };
    summary.trial[dialect] = {
      id: trialValue[dialect].id,
      segments: (trialValue[dialect].segments || []).length
    };
  });

  return summary;
}

function buildMissingAudioManifest(catalogValue, trialValue) {
  const entries = [
    ...collectItems(catalogValue),
    ...DIALECTS.filter((dialect) => trialValue[dialect]).map((dialect) => ({ dialect, levelId: 'trial', lessonId: 'trial', item: trialValue[dialect] }))
  ];

  return entries.flatMap((entry) =>
    collectAudioRefsForItem(entry)
      .map((ref) => ({ ...entry, ref }))
      .filter(({ ref }) => {
        const filePath = resolveAssetPath(ref.path);
        return filePath && !fs.existsSync(filePath);
      })
      .map(({ dialect, levelId, lessonId, item, ref }) => ({
        dialect,
        levelId,
        lessonId,
        itemId: item.id,
        text: ref.text || item.text,
        itemText: item.text,
        scope: ref.scope,
        mode: ref.mode,
        expectedPath: ref.path
      }))
  );
}

function writeReports(summary, missingAudio) {
  ensureReportDir();
  fs.writeFileSync(path.join(REPORT_DIR, 'release-content-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(REPORT_DIR, 'missing-audio-manifest.json'), `${JSON.stringify(missingAudio, null, 2)}\n`, 'utf8');
}

function run() {
  const releaseCatalog = filterCatalogForRelease(catalog);
  const releaseTrial = filterTrialForRelease(trialItems);
  assertCatalogShape(releaseCatalog);
  DIALECTS.forEach((dialect) => assertTrialShape(releaseTrial[dialect], dialect, releaseCatalog));
  assertMirrorConsistency(releaseCatalog);
  assertLessonThresholds(releaseCatalog);
  collectItems(releaseCatalog).forEach(assertReleaseItemAudio);
  DIALECTS.forEach((dialect) => assertReleaseItemAudio({ dialect, item: releaseTrial[dialect] }));

  const summary = buildSummary(releaseCatalog, releaseTrial);
  const missingAudio = buildMissingAudioManifest(releaseCatalog, releaseTrial);
  writeReports(summary, missingAudio);

  console.log(`Release content audit passed. Items: ${DIALECTS.map((dialect) => `${dialect}=${summary.dialects[dialect].items}`).join(', ')}, missingAudio=${missingAudio.length}`);
}

run();
