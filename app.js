const store = require('./utils/store');
const { runStartupHealthCheck } = require('./utils/startup-check');
const { flushSyncQueue } = require('./utils/sync-queue');
const { enableShareMenu } = require('./utils/share');

App({
  onLaunch() {
    store.ensureState();
    enableShareMenu();
    runStartupHealthCheck()
      .then(() => flushSyncQueue())
      .catch(() => {});
  },

  getState() {
    return store.getState();
  }
});
