const store = require('../../utils/store');
const { syncCatalog, syncTrial } = require('../../services/content-sync');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    dialects: [
      { id: 'north', name: '北越', description: '河内标准音路线，声调区分清晰。' },
      { id: 'south', name: '南越', description: '西贡语流路线，口感更松弛。' }
    ],
    selectedDialect: 'north',
    avatarText: 'V',
    otherLanguages: [
      { id: 'thai', name: '泰语', sub: 'ภาษาไทย', tone: 'warm', icon: 'temple' },
      { id: 'malay', name: '马来语', sub: 'Bahasa Melayu', tone: 'forest', icon: 'city' },
      { id: 'tagalog', name: '菲律宾语', sub: 'Tagalog', tone: 'mint', icon: 'boat' }
    ]
  },

  async onLoad() {
    const state = store.getState();
    const nickName = state.auth.nickName || '发音练习学员';
    this.setData({
      selectedDialect: state.selectedDialect || 'north',
      avatarText: nickName.slice(0, 1).toUpperCase() || 'V'
    });

    try {
      await syncCatalog();
      const dialectIds = store.getDialectIds();
      this.setData({
        dialects: ['north', 'south'].filter((dialect) => dialectIds.includes(dialect)).map((dialect) => {
          const meta = store.getLanguageInfo(dialect);
          return {
            id: dialect,
            name: meta.name,
            description: meta.description
          };
        }),
        otherLanguages: this.data.otherLanguages
          .filter((item) => dialectIds.includes(item.id))
          .map((item) => {
            const meta = store.getLanguageInfo(item.id);
            return {
              ...item,
              name: meta.name || item.name,
              sub: meta.englishName || item.sub,
              description: meta.description || ''
            };
          })
      });
    } catch (error) {
      // keep local fallback
    }
  },

  chooseDialect(event) {
    const dialect = event.currentTarget.dataset.dialect;
    this.setData({ selectedDialect: dialect });
    store.setSelectedDialect(dialect);
  },

  chooseLanguage(event) {
    const dialect = event.currentTarget.dataset.dialect;
    this.setData({ selectedDialect: dialect });
    store.setSelectedDialect(dialect);
    this.startTrial();
  },

  async previewAudio(event) {
    const dialect = event.currentTarget.dataset.dialect;
    try {
      await syncTrial(dialect);
    } catch (error) {
      // keep local fallback
    }
    const meta = store.getDialectMeta(dialect);
    if (!this.audio) this.audio = wx.createInnerAudioContext();
    this.audio.src = meta.previewAudio;
    this.audio.play();
    wx.showToast({ title: `${meta.name}示范音`, icon: 'none' });
  },

  async startTrial() {
    const dialect = this.data.selectedDialect;
    store.setSelectedDialect(dialect);
    try {
      await syncTrial(dialect);
    } catch (error) {
      // keep local fallback
    }
    wx.navigateTo({ url: `/pages/trial/index?dialect=${dialect}&mode=trial` });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
  }
}, { path: '/pages/landing/index?from=share' }));
