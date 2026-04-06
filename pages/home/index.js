const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');

Page({
  data: {
    selectedDialect: 'north',
    dialectLabel: '北越',
    unlocked: false,
    loggedIn: false,
    hasPhone: false,
    continueTarget: null,
    levels: []
  },

  async onShow() {
    await this.refreshState();
  },

  async refreshState() {
    try {
      await syncCatalog();
    } catch (error) {
      // keep local fallback
    }

    let state = store.getState();
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteUser = await appApi.fetchUserState(userId);
        state = store.hydrateFromRemoteUser(remoteUser);
      } catch (error) {
        // keep local fallback
      }
    }

    const selectedDialect = state.selectedDialect;
    const dialectLabel = selectedDialect === 'south' ? '南越' : '北越';
    const continueTarget = store.getContinueTarget(selectedDialect);

    let levels = store.getLevels(selectedDialect).map((level) => ({
      ...level,
      progress: store.getLevelProgress(selectedDialect, level.id)
    }));

    if (userId) {
      try {
        const remoteLevels = await appApi.fetchLevels(userId, selectedDialect);
        levels = levels.map((level) => {
          const remote = remoteLevels.find((entry) => entry.id === level.id);
          return remote ? { ...level, progress: remote.progress } : level;
        });
      } catch (error) {
        // keep local fallback
      }
    }

    this.setData({
      selectedDialect,
      dialectLabel,
      unlocked: !!state.product.unlocked,
      loggedIn: !!state.auth.loggedIn,
      hasPhone: !!state.auth.phone,
      continueTarget,
      levels
    });
  },

  goContinue() {
    if (!this.data.unlocked) {
      wx.navigateTo({ url: '/pages/contact/index?from=home' });
      return;
    }
    wx.navigateTo({ url: `/pages/practice/index?itemId=${this.data.continueTarget.itemId}` });
  },

  goLevels() {
    if (!this.data.unlocked) {
      wx.navigateTo({ url: '/pages/contact/index?from=home' });
      return;
    }
    wx.navigateTo({ url: '/pages/levels/index' });
  },

  goRedeem() {
    if (!this.data.loggedIn) {
      wx.navigateTo({ url: '/pages/login/index?next=/pages/redeem/index' });
      return;
    }
    if (!this.data.hasPhone) {
      wx.navigateTo({ url: '/pages/bind-phone/index?next=/pages/redeem/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/redeem/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=home' });
  }
});
