const store = require('../../utils/store');
const appApi = require('../../services/app-api');

Page({
  data: {
    unlocked: false,
    dialectLabel: '北越',
    items: []
  },

  async onShow() {
    const dialect = store.getState().selectedDialect;
    let items = store.getWeakItems(dialect);
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteItems = await appApi.fetchWeakness(userId, dialect);
        items = remoteItems.map((item) => ({
          itemId: item.itemId,
          text: item.itemText || item.text,
          translation: item.itemTranslation || item.translation,
          total: item.total,
          passed: item.passed,
          lessonId: item.lessonId,
          levelId: item.levelId,
          issueTexts: (item.issueIndices || []).map((index) => item.segments?.[index]?.tip).filter(Boolean)
        }));
      } catch (error) {
        // keep local fallback
      }
    }

    this.setData({
      unlocked: store.isUnlocked(),
      dialectLabel: dialect === 'south' ? '南越' : '北越',
      items
    });
  },

  openItem(event) {
    const itemId = event.currentTarget.dataset.itemId;
    if (!this.data.unlocked) {
      wx.navigateTo({ url: '/pages/contact/index?from=weakness' });
      return;
    }
    wx.navigateTo({ url: `/pages/practice/index?itemId=${itemId}` });
  },

  goTrial() {
    wx.navigateTo({ url: '/pages/dialect/index?entry=weakness' });
  }
});
