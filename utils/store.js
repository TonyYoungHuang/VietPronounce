const { catalog: localCatalog, levels, trialItems: localTrialItems, redeemCodes } = require('../data/mock');

const STORAGE_KEY = 'vi_coach_state_v1';

function getCatalogSource(state) {
  return (state && state.content && state.content.catalog) || localCatalog;
}

function getTrialSource(state) {
  return (state && state.content && state.content.trial) || localTrialItems;
}

function defaultDialectProgressWithCatalog(catalog, dialect) {
  const firstLevel = catalog[dialect].levels[0];
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
  return defaultDialectProgressWithCatalog(localCatalog, dialect);
}

function createDefaultState() {
  return {
    selectedDialect: 'north',
    auth: { loggedIn: false, userId: '', nickName: '', phone: '' },
    product: { unlocked: false, redeemedCode: '', redeemedAt: '' },
    trial: { dialect: 'north', completed: false, result: null },
    latestPracticeResult: null,
    content: {
      catalog: null,
      trial: null,
      syncedAt: ''
    },
    dialects: {
      north: defaultDialectProgress('north'),
      south: defaultDialectProgress('south')
    }
  };
}

function mergeDialectProgress(rawDialects, catalogSource) {
  return {
    north: {
      ...defaultDialectProgressWithCatalog(catalogSource, 'north'),
      ...((rawDialects || {}).north || {})
    },
    south: {
      ...defaultDialectProgressWithCatalog(catalogSource, 'south'),
      ...((rawDialects || {}).south || {})
    }
  };
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
    const catalogSource = content.catalog || localCatalog;

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
  const nextState = {
    ...defaults,
    ...remoteUser,
    auth: { ...defaults.auth, ...(remoteUser.auth || {}) },
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
    state.content.catalog = remoteCatalog;
    state.content.syncedAt = new Date().toISOString();
    state.dialects = mergeDialectProgress(state.dialects, remoteCatalog);
    return state;
  });
}

function setRemoteTrial(remoteTrial) {
  return updateState((state) => {
    state.content.trial = {
      ...(state.content.trial || {}),
      [remoteTrial.id && remoteTrial.id.startsWith('south') ? 'south' : state.selectedDialect]: remoteTrial
    };
    state.content.syncedAt = new Date().toISOString();
    return state;
  });
}

function setRemoteTrialByDialect(dialect, remoteTrial) {
  return updateState((state) => {
    state.content.trial = {
      ...(state.content.trial || {}),
      [dialect]: remoteTrial
    };
    state.content.syncedAt = new Date().toISOString();
    return state;
  });
}

function getDialectMeta(dialect) {
  const catalog = getCatalogSource(getState());
  return catalog[dialect] || catalog.north;
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
  return trial[dialect] || localTrialItems[dialect];
}

function getItemResult(dialect, itemId) {
  return getState().dialects[dialect].itemResults[itemId] || null;
}

function getLevelProgress(dialect, levelId) {
  const lessons = getLessons(dialect, levelId);
  const ids = lessons.flatMap((lesson) => lesson.items.map((item) => item.id));
  const results = getState().dialects[dialect].itemResults;
  const passed = ids.filter((id) => results[id] && results[id].passed).length;
  return { passed, total: ids.length, percent: ids.length ? Math.round((passed / ids.length) * 100) : 0 };
}

function getLessonProgress(dialect, lessonId) {
  const lesson = findLessonById(dialect, lessonId);
  if (!lesson) return { passed: 0, total: 0, percent: 0 };
  const ids = lesson.items.map((item) => item.id);
  const results = getState().dialects[dialect].itemResults;
  const passed = ids.filter((id) => results[id] && results[id].passed).length;
  return { passed, total: ids.length, percent: ids.length ? Math.round((passed / ids.length) * 100) : 0 };
}

function getContinueTarget(dialect) {
  const state = getState();
  const progress = state.dialects[dialect];
  const item = findItemById(dialect, progress.lastItemId);
  if (item) {
    return {
      levelId: progress.lastLevelId,
      lessonId: progress.lastLessonId,
      itemId: progress.lastItemId,
      text: item.text,
      translation: item.translation
    };
  }
  const firstLesson = getDialectMeta(dialect).levels[0].lessons[0];
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
    state.selectedDialect = dialect;
    return state;
  });
}

function saveTrialResult(dialect, payload) {
  return updateState((state) => {
    state.trial = { dialect, completed: true, result: payload };
    return state;
  });
}

function getTrialResult() {
  return getState().trial;
}

function mockLogin() {
  return updateState((state) => {
    state.auth.loggedIn = true;
    state.auth.nickName = state.auth.nickName || '发音练习学员';
    return state;
  });
}

function bindPhone(phone) {
  return updateState((state) => {
    state.auth.phone = phone;
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
    draft.product.redeemedCode = normalized;
    draft.product.redeemedAt = new Date().toISOString();
    return draft;
  });
  return { ok: true, message: '兑换成功，北越与南越体系都已解锁。' };
}

function isLoggedIn() {
  return !!getState().auth.loggedIn;
}

function getUserId() {
  return getState().auth.userId || '';
}

function hasBoundPhone() {
  return !!getState().auth.phone;
}

function isUnlocked() {
  return !!getState().product.unlocked;
}

function createTrialAttempt(dialect) {
  const item = getTrialItem(dialect);
  return {
    dialect,
    item,
    attemptCount: 1
  };
}

function createPracticeAttempt(dialect, itemId) {
  const item = findItemById(dialect, itemId);
  const previous = getItemResult(dialect, itemId);
  return {
    dialect,
    itemId,
    item,
    attemptCount: previous ? (previous.attemptCount || 1) + 1 : 1,
    previous
  };
}

function normalizeScorePayload(context, scorePayload) {
  return {
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
    scoreSource: scorePayload.scoreSource || 'mock',
    rawScoreData: scorePayload.rawScoreData || null,
    practicedAt: new Date().toISOString(),
    recordAudio: scorePayload.recordAudio || '',
    demoAudio: context.item.demoAudio
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
  const payload = normalizeScorePayload(context, scorePayload);
  updateState((state) => {
    state.latestPracticeResult = payload;
    state.dialects[dialect].itemResults[context.itemId] = payload;
    state.dialects[dialect].lastItemId = context.itemId;
    state.dialects[dialect].lastLessonId = context.item.lessonId;
    state.dialects[dialect].lastLevelId = payload.levelId;
    return state;
  });
  return payload;
}

function getLatestPracticeResult() {
  return getState().latestPracticeResult;
}

function getWeakItems(dialect) {
  return Object.values(getState().dialects[dialect].itemResults)
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

module.exports = {
  catalog: localCatalog,
  trialItems: localTrialItems,
  ensureState,
  getState,
  hydrateFromRemoteUser,
  setRemoteCatalog,
  setRemoteTrial,
  setRemoteTrialByDialect,
  getLevels,
  getLessons,
  getLessonCards,
  getLevelProgress,
  getContinueTarget,
  getDialectMeta,
  getTrialItem,
  findItemById,
  getItemResult,
  setSelectedDialect,
  saveTrialResult,
  getTrialResult,
  mockLogin,
  bindPhone,
  redeem,
  isLoggedIn,
  getUserId,
  hasBoundPhone,
  isUnlocked,
  createTrialAttempt,
  createPracticeAttempt,
  persistTrialScore,
  persistPracticeScore,
  getLatestPracticeResult,
  getWeakItems
};
