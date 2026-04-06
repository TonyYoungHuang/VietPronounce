const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');

Page({
  data: {
    dialectLabel: '北越',
    levels: []
  },

  async onShow() {
    try {
      await syncCatalog();
    } catch (error) {
      // keep local fallback
    }

    const dialect = store.getState().selectedDialect;
    const userId = store.getUserId();
    let levels = store.getLevels(dialect).map((level) => ({
      ...level,
      progress: store.getLevelProgress(dialect, level.id)
    }));

    if (userId) {
      try {
        const remoteLevels = await appApi.fetchLevels(userId, dialect);
        levels = levels.map((level) => {
          const remote = remoteLevels.find((entry) => entry.id === level.id);
          return remote ? { ...level, progress: remote.progress } : level;
        });
      } catch (error) {
        // keep local fallback
      }
    }

    this.setData({
      dialectLabel: dialect === 'south' ? '南越' : '北越',
      levels
    });
  },

  openLevel(event) {
    wx.navigateTo({ url: `/pages/lesson/index?levelId=${event.currentTarget.dataset.levelId}` });
  }
});
