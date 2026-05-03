const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const syncTabBar = require('../../utils/tab-bar');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    unlocked: false,
    dialectLabel: '北越',
    items: [],
    issueGroups: []
  },

  async onShow() {
    syncTabBar(this, 'pages/weakness/index');
    const dialect = store.getState().selectedDialect || 'north';
    let items = store.getWeakItems(dialect);
    let issueGroups = store.getWeakIssueGroups(dialect);
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteItems = await appApi.fetchWeakness(userId, dialect);
        issueGroups = store.buildWeakIssueGroupsFromResults(remoteItems);
        items = remoteItems.map((item) => ({
          itemId: item.itemId,
          text: item.itemText || item.text,
          translation: item.itemTranslation || item.translation,
          total: item.total,
          passed: item.passed,
          lessonId: item.lessonId,
          levelId: item.levelId,
          pronunciationDimensions: item.pronunciationDimensions || [],
          issueTexts: (item.issueIndices || []).map((index) => item.segments?.[index]?.tip).filter(Boolean)
        }));
      } catch (error) {
        // keep local fallback
      }
    }

    this.setData({
      unlocked: store.isDialectUnlocked(dialect),
      dialectLabel: store.getLanguageInfo(dialect).name,
      items,
      issueGroups
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
  },

  goDialect() {
    wx.navigateTo({ url: '/pages/dialect/index' });
  },

  goLevels() {
    wx.navigateTo({ url: '/pages/levels/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
