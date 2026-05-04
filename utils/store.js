const { catalog: localCatalog, levels, trialItems: localTrialItems, redeemCodes } = require('../data/mock');
const { DIALECTS, getLanguageMeta, normalizeDialect } = require('../data/content-standard');
const { filterCatalogForRelease, filterTrialForRelease, hasPlaceholder } = require('./content-filter');

const STORAGE_KEY = 'vi_coach_state_v1';

function getCatalogSource(state) {
  return filterCatalogForRelease((state && state.content && state.content.catalog) || localCatalog);
}

function getTrialSource(state) {
  return filterTrialForRelease((state && state.content && state.content.trial) || localTrialItems);
}

function defaultDialectProgressWithCatalog(catalog, dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  const firstLevel = catalog[normalizedDialect].levels[0];
  const firstLesson = firstLevel.lessons[0];
  const firstItem = firstLesson.items[0];
  return {
    lastLevelId: firstLevel.id,
    lastLessonId: firstLesson.id,
    lastItemId: firstItem.id,
    itemResults: {}
  };
}

function defaultDialectProgress(dialect) {
  return defaultDialectProgressWithCatalog(filterCatalogForRelease(localCatalog), dialect);
}

function createDefaultState() {
  return {
    selectedDialect: 'north',
    auth: { loggedIn: false, userId: '', nickName: '' },
    product: { unlocked: false, unlockedDialects: [], redeemedCode: '', redeemedAt: '' },
    trial: { dialect: 'north', completed: false, result: null },
    latestPracticeResult: null,
    content: {
      catalog: null,
      trial: null,
      syncedAt: ''
    },
    dialects: DIALECTS.reduce((accumulator, dialect) => {
      accumulator[dialect] = defaultDialectProgress(dialect);
      return accumulator;
    }, {})
  };
}

function mergeDialectProgress(rawDialects, catalogSource) {
  return DIALECTS.reduce((accumulator, dialect) => {
    accumulator[dialect] = {
      ...defaultDialectProgressWithCatalog(catalogSource, dialect),
      ...((rawDialects || {})[dialect] || {})
    };
    return accumulator;
  }, {});
}

function getState() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const defaults = createDefaultState();
    const content = {
      ...defaults.content,
      ...(raw.content || {})
    };
    const catalogSource = getCatalogSource({ content });

    return {
      ...defaults,
      ...raw,
      auth: { ...defaults.auth, ...(raw.auth || {}) },
      product: { ...defaults.product, ...(raw.product || {}) },
      trial: { ...defaults.trial, ...(raw.trial || {}) },
      content,
      dialects: mergeDialectProgress(raw.dialects, catalogSource)
    };
  } catch (error) {
    return createDefaultState();
  }
}

function saveState(state) {
  wx.setStorageSync(STORAGE_KEY, state);
}

function ensureState() {
  const state = getState();
  saveState(state);
  return state;
}

function updateState(updater) {
  const state = getState();
  const next = updater(state) || state;
  saveState(next);
  return next;
}

function hydrateFromRemoteUser(remoteUser) {
  if (!remoteUser) return getState();
  const previous = getState();
  const defaults = createDefaultState();
  const catalogSource = getCatalogSource(previous);
  const remoteUserId = remoteUser.userId || (remoteUser.auth && remoteUser.auth.userId) || '';
  const nextState = {
    ...defaults,
    ...remoteUser,
    auth: { ...defaults.auth, ...(remoteUser.auth || {}), userId: remoteUserId },
    product: { ...defaults.product, ...(remoteUser.product || {}) },
    trial: previous.trial,
    latestPracticeResult: remoteUser.latestPracticeResult || previous.latestPracticeResult,
    content: previous.content,
    dialects: mergeDialectProgress(remoteUser.dialects, catalogSource)
  };
  saveState(nextState);
  return nextState;
}

function setRemoteCatalog(remoteCatalog) {
  return updateState((state) => {
    state.content.catalog = filterCatalogForRelease(remoteCatalog);
    state.content.syncedAt = new Date().toISOString();
    state.dialects = mergeDialectProgress(state.dialects, state.content.catalog);
    return state;
  });
}

function setRemoteTrial(remoteTrial) {
  return updateState((state) => {
    const matchedDialect = DIALECTS.find((dialect) => remoteTrial.id && remoteTrial.id.startsWith(dialect));
    const trialDialect = matchedDialect || normalizeDialect(state.selectedDialect);
    state.content.trial = {
      ...(state.content.trial || {}),
      [trialDialect]: filterTrialForRelease({
        [trialDialect]: remoteTrial
      })[trialDialect]
    };
    state.content.syncedAt = new Date().toISOString();
    return state;
  });
}

function setRemoteTrialByDialect(dialect, remoteTrial) {
  return updateState((state) => {
    const normalizedDialect = normalizeDialect(dialect);
    state.content.trial = {
      ...(state.content.trial || {}),
      [normalizedDialect]: filterTrialForRelease({ [normalizedDialect]: remoteTrial })[normalizedDialect]
    };
    state.content.syncedAt = new Date().toISOString();
    return state;
  });
}

function getDialectMeta(dialect) {
  const catalog = getCatalogSource(getState());
  return catalog[normalizeDialect(dialect)] || catalog.north;
}

function getDialectIds() {
  const catalog = getCatalogSource(getState());
  return DIALECTS.filter((dialect) => catalog[dialect]);
}

function getDialectLabel(dialect) {
  const meta = getDialectMeta(dialect);
  return meta.name || getLanguageMeta(dialect).name;
}

function getLanguageInfo(dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  return {
    ...getLanguageMeta(normalizedDialect),
    ...getDialectMeta(normalizedDialect)
  };
}

function getLevels(dialect) {
  return getDialectMeta(dialect).levels.map((level) => ({
    id: level.id,
    name: level.name,
    subtitle: levels.find((item) => item.id === level.id)?.subtitle || '',
    accent: levels.find((item) => item.id === level.id)?.accent || '',
    lessonCount: level.lessons.length,
    itemCount: level.lessons.reduce((sum, lesson) => sum + lesson.items.length, 0)
  }));
}

function getLessons(dialect, levelId) {
  const level = getDialectMeta(dialect).levels.find((item) => item.id === levelId);
  return level ? level.lessons : [];
}

function findLessonById(dialect, lessonId) {
  return getDialectMeta(dialect).levels.flatMap((level) => level.lessons).find((lesson) => lesson.id === lessonId);
}

function findLevelByLessonId(dialect, lessonId) {
  return getDialectMeta(dialect).levels.find((level) => level.lessons.some((lesson) => lesson.id === lessonId));
}

function findItemById(dialect, itemId) {
  const lessons = getDialectMeta(dialect).levels.flatMap((level) => level.lessons);
  for (const lesson of lessons) {
    const item = lesson.items.find((entry) => entry.id === itemId);
    if (item) return { ...item, lessonId: lesson.id };
  }
  return null;
}

function getTrialItem(dialect) {
  const state = getState();
  const trial = getTrialSource(state);
  const normalizedDialect = normalizeDialect(dialect);
  return trial[normalizedDialect] || localTrialItems[normalizedDialect] || localTrialItems.north;
}

function getItemResult(dialect, itemId) {
  const normalizedDialect = normalizeDialect(dialect);
  return getState().dialects[normalizedDialect].itemResults[itemId] || null;
}

function getLevelProgress(dialect, levelId) {
  const normalizedDialect = normalizeDialect(dialect);
  const lessons = getLessons(normalizedDialect, levelId);
  const ids = lessons.flatMap((lesson) => lesson.items.map((item) => item.id));
  const results = getState().dialects[normalizedDialect].itemResults;
  const passed = ids.filter((id) => results[id] && results[id].passed).length;
  return { passed, total: ids.length, percent: ids.length ? Math.round((passed / ids.length) * 100) : 0 };
}

function getLessonProgress(dialect, lessonId) {
  const normalizedDialect = normalizeDialect(dialect);
  const lesson = findLessonById(normalizedDialect, lessonId);
  if (!lesson) return { passed: 0, total: 0, percent: 0 };
  const ids = lesson.items.map((item) => item.id);
  const results = getState().dialects[normalizedDialect].itemResults;
  const passed = ids.filter((id) => results[id] && results[id].passed).length;
  return { passed, total: ids.length, percent: ids.length ? Math.round((passed / ids.length) * 100) : 0 };
}

function getContinueTarget(dialect) {
  const state = getState();
  const normalizedDialect = normalizeDialect(dialect);
  const progress = state.dialects[normalizedDialect];
  const item = findItemById(normalizedDialect, progress.lastItemId);
  if (item) {
    return {
      levelId: progress.lastLevelId,
      lessonId: progress.lastLessonId,
      itemId: progress.lastItemId,
      text: item.text,
      translation: item.translation
    };
  }
  const firstLesson = getDialectMeta(normalizedDialect).levels[0].lessons[0];
  const firstItem = firstLesson.items[0];
  return {
    levelId: 'beginner',
    lessonId: firstLesson.id,
    itemId: firstItem.id,
    text: firstItem.text,
    translation: firstItem.translation
  };
}

function setSelectedDialect(dialect) {
  return updateState((state) => {
    state.selectedDialect = normalizeDialect(dialect);
    return state;
  });
}

function saveTrialResult(dialect, payload) {
  const normalizedDialect = normalizeDialect(dialect);
  return updateState((state) => {
    state.trial = { dialect: normalizedDialect, completed: true, result: payload };
    return state;
  });
}

function getTrialResult() {
  return getState().trial;
}

function createLocalSession() {
  return updateState((state) => {
    state.auth.loggedIn = true;
    state.auth.nickName = state.auth.nickName || '发音练习学员';
    return state;
  });
}

function redeem(code) {
  const normalized = String(code || '').trim().toUpperCase();
  const state = getState();
  if (state.product.unlocked) return { ok: false, message: '当前账号已经开通完整版，无需重复兑换。' };
  if (!redeemCodes.includes(normalized)) return { ok: false, message: '兑换码无效，请核对后再试。' };
  updateState((draft) => {
    draft.product.unlocked = true;
    draft.product.unlockedDialects = DIALECTS.slice();
    draft.product.redeemedCode = normalized;
    draft.product.redeemedAt = new Date().toISOString();
    return draft;
  });
  return { ok: true, message: '兑换成功，全部语言课程都已解锁。' };
}

function isLoggedIn() {
  return !!getState().auth.loggedIn;
}

function getUserId() {
  const state = getState();
  return state.auth.userId || state.userId || '';
}

function isUnlocked() {
  return !!getState().product.unlocked;
}

function isDialectUnlocked(dialect) {
  const state = getState();
  const normalizedDialect = normalizeDialect(dialect || state.selectedDialect);
  return !!state.product.unlocked || (Array.isArray(state.product.unlockedDialects) && state.product.unlockedDialects.includes(normalizedDialect));
}

function createTrialAttempt(dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  const item = getTrialItem(normalizedDialect);
  return {
    dialect: normalizedDialect,
    item,
    attemptCount: 1
  };
}

function createPracticeAttempt(dialect, itemId) {
  const normalizedDialect = normalizeDialect(dialect);
  const item = findItemById(normalizedDialect, itemId);
  const previous = getItemResult(normalizedDialect, itemId);
  return {
    dialect: normalizedDialect,
    itemId,
    item,
    attemptCount: previous ? (previous.attemptCount || 1) + 1 : 1,
    previous
  };
}

function normalizeScorePayload(context, scorePayload) {
  return {
    dialect: context.dialect,
    total: scorePayload.total,
    completeness: scorePayload.completeness,
    accuracy: scorePayload.accuracy,
    fluency: scorePayload.fluency,
    passed: !!scorePayload.passed,
    issueIndices: scorePayload.issueIndices || [],
    segments: context.item.segments,
    attemptCount: context.attemptCount,
    itemId: context.item.id,
    itemText: context.item.text,
    itemTranslation: context.item.translation,
    lessonId: context.item.lessonId,
    levelId: findLevelByLessonId(context.dialect, context.item.lessonId)?.id || context.item.levelId || 'beginner',
    durationMs: scorePayload.durationMs || 0,
    audioQuality: scorePayload.audioQuality || null,
    pronunciationDimensions: scorePayload.pronunciationDimensions || [],
    scoreSource: scorePayload.scoreSource || 'standard',
    rawScoreData: scorePayload.rawScoreData || null,
    practicedAt: new Date().toISOString(),
    recordAudio: scorePayload.recordAudio || '',
    demoAudio: context.item.demoAudio
  };
}

function createAttemptRecord(payload) {
  return {
    total: payload.total,
    completeness: payload.completeness,
    accuracy: payload.accuracy,
    fluency: payload.fluency,
    passed: payload.passed,
    issueIndices: payload.issueIndices || [],
    pronunciationDimensions: payload.pronunciationDimensions || [],
    durationMs: payload.durationMs || 0,
    scoreSource: payload.scoreSource || '',
    practicedAt: payload.practicedAt || new Date().toISOString()
  };
}

function attachAttemptHistory(payload, previousResult) {
  const previousAttempts = Array.isArray(previousResult && previousResult.attempts) ? previousResult.attempts : [];
  const previousScore = previousResult && Number.isFinite(Number(previousResult.total)) ? Number(previousResult.total) : null;
  const attempts = [createAttemptRecord(payload), ...previousAttempts].slice(0, 5);
  return {
    ...payload,
    previousScore,
    scoreDelta: previousScore === null ? 0 : payload.total - previousScore,
    attempts
  };
}

function persistTrialScore(dialect, context, scorePayload) {
  const payload = normalizeScorePayload(context, scorePayload);
  saveTrialResult(dialect, {
    ...payload,
    text: context.item.text,
    translation: context.item.translation,
    dialect,
    demoAudio: context.item.demoAudio
  });
  return payload;
}

function persistPracticeScore(dialect, context, scorePayload) {
  const normalizedDialect = normalizeDialect(dialect);
  const basePayload = normalizeScorePayload(context, scorePayload);
  updateState((state) => {
    const previousResult = state.dialects[normalizedDialect].itemResults[context.itemId] || null;
    const payload = attachAttemptHistory(basePayload, previousResult);
    state.latestPracticeResult = payload;
    state.dialects[normalizedDialect].itemResults[context.itemId] = payload;
    state.dialects[normalizedDialect].lastItemId = context.itemId;
    state.dialects[normalizedDialect].lastLessonId = context.item.lessonId;
    state.dialects[normalizedDialect].lastLevelId = payload.levelId;
    return state;
  });
  return getState().dialects[normalizedDialect].itemResults[context.itemId];
}

function getLatestPracticeResult() {
  return getState().latestPracticeResult;
}

function getWeakItems(dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  return Object.values(getState().dialects[normalizedDialect].itemResults)
    .filter((item) => !hasPlaceholder(item.itemText) && !hasPlaceholder(item.itemTranslation))
    .filter((item) => !item.passed || item.total < 82)
    .sort((a, b) => a.total - b.total)
    .slice(0, 8)
    .map((item) => ({
      itemId: item.itemId,
      text: item.itemText,
      translation: item.itemTranslation,
      total: item.total,
      passed: item.passed,
      lessonId: item.lessonId,
      levelId: item.levelId,
      issueTexts: item.issueIndices.map((index) => item.segments[index]?.tip).filter(Boolean)
    }));
}

function buildWeakIssueGroupsFromResults(results) {
  const groups = {};
  results
    .filter((item) => !hasPlaceholder(item.itemText || item.text) && !hasPlaceholder(item.itemTranslation || item.translation))
    .forEach((item) => {
      const dimensions = Array.isArray(item.pronunciationDimensions) ? item.pronunciationDimensions : [];
      dimensions
        .filter((dimension) => Number(dimension.score || 0) < 82 || dimension.status === '重点')
        .forEach((dimension) => {
          const key = dimension.key || dimension.label || 'general';
          if (!groups[key]) {
            groups[key] = {
              key,
              label: dimension.label || '综合纠音',
              count: 0,
              totalScore: 0,
              items: []
            };
          }
          groups[key].count += 1;
          groups[key].totalScore += Number(dimension.score || item.total || 0);
          groups[key].items.push({
            itemId: item.itemId,
            text: item.itemText || item.text,
            translation: item.itemTranslation || item.translation,
            score: Number(dimension.score || item.total || 0),
            tip: dimension.tip || '',
            focus: dimension.focus || ''
          });
        });
    });

  return Object.values(groups)
    .map((group) => ({
      ...group,
      averageScore: group.count ? Math.round(group.totalScore / group.count) : 0,
      items: group.items.sort((left, right) => left.score - right.score).slice(0, 4)
    }))
    .sort((left, right) => left.averageScore - right.averageScore)
    .slice(0, 5);
}

function getWeakIssueGroups(dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  return buildWeakIssueGroupsFromResults(Object.values(getState().dialects[normalizedDialect].itemResults));
}

function getLessonCards(dialect, levelId) {
  return getLessons(dialect, levelId).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    progress: getLessonProgress(dialect, lesson.id),
    items: lesson.items.map((item) => {
      const result = getItemResult(dialect, item.id);
      return {
        id: item.id,
        text: item.text,
        translation: item.translation,
        type: item.type,
        passed: !!(result && result.passed),
        total: result ? result.total : 0,
        attempted: !!result
      };
    })
  }));
}

function getNextItemId(dialect, itemId) {
  const items = getDialectMeta(dialect).levels.flatMap((level) =>
    level.lessons.flatMap((lesson) => lesson.items.map((item) => item.id))
  );
  const currentIndex = items.indexOf(itemId);
  if (currentIndex < 0 || currentIndex >= items.length - 1) {
    return '';
  }
  return items[currentIndex + 1];
}

module.exports = {
  catalog: filterCatalogForRelease(localCatalog),
  trialItems: filterTrialForRelease(localTrialItems),
  ensureState,
  getState,
  hydrateFromRemoteUser,
  setRemoteCatalog,
  setRemoteTrial,
  setRemoteTrialByDialect,
  getLevels,
  getLessons,
  getLessonCards,
  getDialectIds,
  getDialectLabel,
  getLanguageInfo,
  getLevelProgress,
  getContinueTarget,
  getNextItemId,
  getDialectMeta,
  getTrialItem,
  findItemById,
  getItemResult,
  setSelectedDialect,
  saveTrialResult,
  getTrialResult,
  createLocalSession,
  redeem,
  isLoggedIn,
  getUserId,
  isUnlocked,
  isDialectUnlocked,
  createTrialAttempt,
  createPracticeAttempt,
  persistTrialScore,
  persistPracticeScore,
  getLatestPracticeResult,
  getWeakItems,
  getWeakIssueGroups,
  buildWeakIssueGroupsFromResults
};
