const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');
const { getOfflineNotice } = require('../../utils/network-status');
const { attachShare } = require('../../utils/share');

const TYPE_LABELS = {
  syllable: '音节',
  word: '单词',
  sentence: '短句'
};

Page(attachShare({
  data: {
    dialect: 'north',
    dialectLabel: '亚洲语种',
    levelId: 'beginner',
    levelName: '零基础',
    lessons: [],
    offlineNotice: ''
  },

  onLoad(query) {
    this.setData({ levelId: query.levelId || 'beginner' });
  },

  async onShow() {
    try {
      await syncCatalog();
    } catch (error) {}

    const dialect = store.getState().selectedDialect;
    const levels = store.getLevels(dialect);
    const currentLevel = levels.find((level) => level.id === this.data.levelId) || levels[0];
    let lessons = store.getLessonCards(dialect, currentLevel.id);
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteLessons = await appApi.fetchLessons(userId, dialect, currentLevel.id);
        lessons = remoteLessons.map((lesson, lessonIndex) => ({
          id: lesson.id,
          order: String(lessonIndex + 1).padStart(2, '0'),
          title: lesson.title,
          summary: lesson.summary,
          progress: {
            passed: lesson.items.filter((item) => item.result && item.result.passed).length,
            total: lesson.items.length
          },
          items: lesson.items.map((item, itemIndex) => ({
            id: item.id,
            order: String(itemIndex + 1).padStart(2, '0'),
            text: item.text,
            translation: item.translation,
            type: item.type,
            typeLabel: TYPE_LABELS[item.type] || item.type,
            passed: !!(item.result && item.result.passed),
            total: item.result ? item.result.total : 0,
            attempted: !!item.result
          }))
        }));
      } catch (error) {}
    } else {
      lessons = lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        order: String(lessonIndex + 1).padStart(2, '0'),
        items: lesson.items.map((item, itemIndex) => ({
          ...item,
          order: String(itemIndex + 1).padStart(2, '0'),
          typeLabel: TYPE_LABELS[item.type] || item.type
        }))
      }));
    }

    this.setData({
      dialect,
      dialectLabel: store.getDialectLabel(dialect),
      levelName: currentLevel.name,
      lessons,
      offlineNotice: getOfflineNotice()
    });
  },

  openItem(event) {
    wx.navigateTo({ url: `/pages/practice/index?itemId=${event.currentTarget.dataset.itemId}` });
  },

  goLevels() {
    wx.navigateTo({ url: `/pages/levels/index` });
  }
}, { path: '/pages/landing/index?from=share' }));
