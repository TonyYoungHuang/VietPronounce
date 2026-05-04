const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');
const syncTabBar = require('../../utils/tab-bar');
const { attachShare } = require('../../utils/share');

function buildRingStyle(percent) {
  return `background: conic-gradient(#00875a 0%, #00875a ${percent}%, #e5ebe7 ${percent}%, #e5ebe7 100%);`;
}

function buildTiles(options) {
  const { unlocked, continueTarget, weakCount } = options;
  if (!unlocked) {
    return [
      {
        id: 'pronunciation',
        action: 'trial',
        tone: 'warm',
        title: '发音纠正',
        subtitle: '先录一条，马上看到完整度、准确度与流利度',
        icon: 'voice'
      },
      {
        id: 'reading',
        action: 'contact',
        tone: 'green',
        title: '短文阅读',
        subtitle: '了解课程内容、开通方式和兑换码流程',
        icon: 'book'
      },
      {
        id: 'culture',
        action: 'profile',
        tone: 'forest',
        title: '文化浸润',
        subtitle: '输入激活码即可开通完整课程，继续保存练习进度',
        icon: 'temple'
      }
    ];
  }

  return [
    {
      id: 'pronunciation',
      action: 'continue',
      tone: 'warm',
      title: '发音纠正',
      subtitle: continueTarget ? `继续练习 ${continueTarget.text}` : '掌握六个核心声调的微妙差别',
      icon: 'voice'
    },
    {
      id: 'reading',
      action: 'levels',
      tone: 'green',
      title: '短文阅读',
      subtitle: '阅读关于河内街头美食的故事',
      icon: 'book'
    },
    {
      id: 'culture',
      action: 'weakness',
      tone: 'forest',
      title: '文化浸润',
      subtitle: weakCount ? `已有 ${weakCount} 个薄弱项等待复练` : '探索越南传统节日与习俗',
      icon: 'temple'
    }
  ];
}

Page(attachShare({
  data: {
    selectedDialect: 'north',
    dialectLabel: '北越',
    unlocked: false,
    loggedIn: false,
    continueTarget: null,
    levels: [],
    heroName: '林先生',
    avatarText: 'V',
    overallPercent: 0,
    ringStyle: buildRingStyle(0),
    outstandingCount: 0,
    currentCourseTitle: '河内方言与基础',
    currentCourseSubtitle: '掌握越南语的声调、音节和日常短句。',
    courseButtonText: '继续课程',
    tiles: []
  },

  async onShow() {
    syncTabBar(this, 'pages/home/index');
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

    const selectedDialect = state.selectedDialect || 'north';
    const languageInfo = store.getLanguageInfo(selectedDialect);
    const dialectLabel = languageInfo.name;
    const continueTarget = store.getContinueTarget(selectedDialect);
    const weakItems = store.getWeakItems(selectedDialect);

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

    const totalPassed = levels.reduce((sum, level) => sum + (level.progress.passed || 0), 0);
    const totalItems = levels.reduce((sum, level) => sum + (level.progress.total || 0), 0);
    const overallPercent = totalItems ? Math.round((totalPassed / totalItems) * 100) : 75;
    const currentLevel = levels.find((level) => level.progress.percent < 100) || levels[0] || null;
    const heroName = state.auth.nickName || '林先生';
    const avatarText = heroName.slice(0, 1).toUpperCase() || 'V';
    const unlocked = store.isDialectUnlocked(selectedDialect);

    this.setData({
      selectedDialect,
      dialectLabel,
      unlocked,
      loggedIn: !!state.auth.loggedIn,
      continueTarget,
      levels,
      heroName,
      avatarText,
      overallPercent,
      ringStyle: buildRingStyle(overallPercent),
      outstandingCount: Math.max(totalItems - totalPassed, 0),
      currentCourseTitle: currentLevel ? currentLevel.name : `${languageInfo.name}发音入门`,
      currentCourseSubtitle: currentLevel ? currentLevel.subtitle : languageInfo.description,
      courseButtonText: unlocked ? '继续课程' : '免费试练',
      tiles: buildTiles({ unlocked, continueTarget, weakCount: weakItems.length })
    });
  },

  goContinue() {
    if (!this.data.unlocked) {
      wx.navigateTo({ url: '/pages/dialect/index' });
      return;
    }
    if (!this.data.continueTarget) {
      this.goLevels();
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

  openTile(event) {
    const action = event.currentTarget.dataset.action;
    if (action === 'continue') return this.goContinue();
    if (action === 'levels') return this.goLevels();
    if (action === 'weakness') return wx.switchTab({ url: '/pages/weakness/index' });
    if (action === 'trial') return wx.navigateTo({ url: '/pages/dialect/index' });
    if (action === 'contact') return wx.navigateTo({ url: '/pages/contact/index?from=home' });
    if (action === 'profile') return wx.switchTab({ url: '/pages/profile/index' });
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  goDialect() {
    wx.navigateTo({ url: '/pages/dialect/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
