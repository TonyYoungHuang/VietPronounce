const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');

Page({
  data: {
    dialect: 'north',
    dialectLabel: '北越',
    levelId: 'beginner',
    levelName: '零基础',
    lessons: []
  },

  onLoad(query) {
    this.setData({ levelId: query.levelId || 'beginner' });
  },

  async onShow() {
    try {
      await syncCatalog();
    } catch (error) {
      // keep local fallback
    }

    const dialect = store.getState().selectedDialect;
    const levels = store.getLevels(dialect);
    const currentLevel = levels.find((level) => level.id === this.data.levelId) || levels[0];
    let lessons = store.getLessonCards(dialect, currentLevel.id);
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteLessons = await appApi.fetchLessons(userId, dialect, currentLevel.id);
        lessons = remoteLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          progress: {
            passed: lesson.items.filter((item) => item.result && item.result.passed).length,
            total: lesson.items.length
          },
          items: lesson.items.map((item) => ({
            id: item.id,
            text: item.text,
            translation: item.translation,
            type: item.type,
            passed: !!(item.result && item.result.passed),
            total: item.result ? item.result.total : 0,
            attempted: !!item.result
          }))
        }));
      } catch (error) {
        // keep local fallback
      }
    }

    this.setData({
      dialect,
      dialectLabel: dialect === 'south' ? '南越' : '北越',
      levelName: currentLevel.name,
      lessons
    });
  },

  openItem(event) {
    wx.navigateTo({ url: `/pages/practice/index?itemId=${event.currentTarget.dataset.itemId}` });
  }
});
