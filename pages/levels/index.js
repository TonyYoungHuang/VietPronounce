const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');
const { getOfflineNotice } = require('../../utils/network-status');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    dialectLabel: '北越',
    levels: [],
    offlineNotice: ''
  },

  async onShow() {
    try {
      await syncCatalog();
    } catch (error) {}

    const dialect = store.getState().selectedDialect;
    const userId = store.getUserId();
    let levels = store.getLevels(dialect).map((level, index) => ({
      ...level,
      order: String(index + 1).padStart(2, '0'),
      progress: store.getLevelProgress(dialect, level.id)
    }));

    if (userId) {
      try {
        const remoteLevels = await appApi.fetchLevels(userId, dialect);
        levels = levels.map((level) => {
          const remote = remoteLevels.find((entry) => entry.id === level.id);
          return remote ? { ...level, progress: remote.progress } : level;
        });
      } catch (error) {}
    }

    this.setData({
      dialectLabel: dialect === 'south' ? '南越' : '北越',
      levels,
      offlineNotice: getOfflineNotice()
    });
  },

  openLevel(event) {
    wx.navigateTo({ url: `/pages/lesson/index?levelId=${event.currentTarget.dataset.levelId}` });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
