const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { syncCatalog, syncTrial } = require('../../services/content-sync');
const { attachShare } = require('../../utils/share');

function buildLanguageCards() {
  const tones = {
    north: 'forest',
    south: 'mint',
    thai: 'warm',
    malay: 'cool',
    indo: 'mint',
    tagalog: 'leaf',
    hindi: 'warm',
    tamil: 'forest'
  };
  const icons = {
    north: 'leaf',
    south: 'river',
    thai: 'temple',
    malay: 'city',
    indo: 'river',
    tagalog: 'boat',
    hindi: 'temple',
    tamil: 'leaf'
  };
  return store.getDialectIds().map((dialect) => {
    const meta = store.getLanguageInfo(dialect);
    return {
      id: dialect,
      name: meta.name,
      sub: meta.englishName || meta.shortName,
      description: meta.description,
      tone: tones[dialect] || 'forest',
      icon: icons[dialect] || 'leaf',
      unlocked: store.isDialectUnlocked(dialect)
    };
  });
}

Page(attachShare({
  data: {
    selectedDialect: 'north',
    languages: [],
    activationCode: '',
    activationLoading: false,
    activationMessage: ''
  },

  async onLoad() {
    try {
      await syncCatalog();
    } catch (error) {}
    const selectedDialect = store.getState().selectedDialect || 'north';
    this.setData({
      selectedDialect,
      languages: buildLanguageCards()
    });
  },

  selectLanguage(event) {
    const dialect = event.currentTarget.dataset.dialect;
    store.setSelectedDialect(dialect);
    this.setData({ selectedDialect: dialect, activationMessage: '' });
  },

  async startSelected() {
    const dialect = this.data.selectedDialect;
    store.setSelectedDialect(dialect);
    try {
      await syncTrial(dialect);
    } catch (error) {}
    if (store.isDialectUnlocked(dialect)) {
      wx.navigateTo({ url: '/pages/levels/index' });
      return;
    }
    wx.navigateTo({ url: `/pages/trial/index?dialect=${dialect}&mode=trial` });
  },

  handleCodeInput(event) {
    this.setData({
      activationCode: String(event.detail.value || '').trim().toUpperCase(),
      activationMessage: ''
    });
  },

  async ensureRemoteUser() {
    const currentUserId = store.getUserId();
    if (currentUserId) return currentUserId;
    const remoteUser = await appApi.createAnonymousUser();
    store.hydrateFromRemoteUser(remoteUser);
    return store.getUserId();
  },

  async activateCode() {
    if (this.data.activationLoading) return;
    const code = String(this.data.activationCode || '').trim().toUpperCase();
    if (!code) {
      wx.showToast({ title: '请输入激活码', icon: 'none' });
      return;
    }

    this.setData({ activationLoading: true, activationMessage: '' });
    try {
      const selectedDialect = this.data.selectedDialect;
      store.setSelectedDialect(selectedDialect);
      const userId = await this.ensureRemoteUser();
      await appApi.updateDialect(userId, selectedDialect).catch(() => null);
      const remoteUser = await appApi.redeem(userId, code);
      const nextState = store.hydrateFromRemoteUser(remoteUser);
      const nextDialect = nextState.selectedDialect || selectedDialect;
      store.setSelectedDialect(nextDialect);
      this.setData({
        selectedDialect: nextDialect,
        languages: buildLanguageCards(),
        activationMessage: '激活成功，正在进入课程。'
      });
      wx.showToast({ title: '激活成功', icon: 'none' });
      setTimeout(() => wx.navigateTo({ url: '/pages/levels/index' }), 350);
    } catch (error) {
      const message = error && error.message ? error.message : '激活失败，请核对激活码';
      this.setData({ activationMessage: message });
      wx.showToast({ title: message, icon: 'none' });
    } finally {
      this.setData({ activationLoading: false });
    }
  },

  goStart() {
    this.startSelected();
  }
}, { path: '/pages/landing/index?from=share' }));
