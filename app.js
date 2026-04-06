const store = require('./utils/store');

App({
  onLaunch() {
    store.ensureState();
  },

  getState() {
    return store.getState();
  }
});
