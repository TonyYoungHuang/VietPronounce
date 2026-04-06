const store = require('../utils/store');
const appApi = require('./app-api');
const { assertCatalogShape, assertTrialShape } = require('../utils/content-validate');

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
    return remoteCatalog;
  } catch (error) {
    return getFallbackCatalog();
  }
}

async function syncTrial(dialect) {
  const normalizedDialect = dialect === 'south' ? 'south' : 'north';
  try {
    const remoteTrial = await appApi.fetchTrial(normalizedDialect);
    assertTrialShape(remoteTrial, normalizedDialect);
    store.setRemoteTrialByDialect(normalizedDialect, remoteTrial);
    return remoteTrial;
  } catch (error) {
    return getFallbackTrial(normalizedDialect);
  }
}

module.exports = {
  syncCatalog,
  syncTrial
};
