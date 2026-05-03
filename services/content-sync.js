const store = require('../utils/store');
const appApi = require('./app-api');
const { normalizeDialect } = require('../data/content-standard');
const { assertCatalogShape, assertTrialShape } = require('../utils/content-validate');
const { markOnline, markUsingCache } = require('../utils/network-status');

function getFallbackCatalog() {
  const state = store.getState();
  return (state.content && state.content.catalog) || store.catalog;
}

function getFallbackTrial(dialect) {
  const state = store.getState();
  const cached = state.content && state.content.trial;
  return (cached && cached[dialect]) || store.getTrialItem(dialect);
}

async function syncCatalog() {
  try {
    const remoteCatalog = await appApi.fetchCatalog();
    assertCatalogShape(remoteCatalog);
    store.setRemoteCatalog(remoteCatalog);
    markOnline();
    return remoteCatalog;
  } catch (error) {
    markUsingCache();
    return getFallbackCatalog();
  }
}

async function syncTrial(dialect) {
  const normalizedDialect = normalizeDialect(dialect);
  try {
    const remoteTrial = await appApi.fetchTrial(normalizedDialect);
    assertTrialShape(remoteTrial, normalizedDialect);
    store.setRemoteTrialByDialect(normalizedDialect, remoteTrial);
    markOnline();
    return remoteTrial;
  } catch (error) {
    markUsingCache();
    return getFallbackTrial(normalizedDialect);
  }
}

module.exports = {
  syncCatalog,
  syncTrial
};
