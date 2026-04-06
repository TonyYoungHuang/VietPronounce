const store = require('../../utils/store');
const { syncCatalog, syncTrial } = require('../../services/content-sync');

Page({
  data: {
    dialects: [
      { id: 'north', name: '北越', description: '标准感更强，音调区分更明显。' },
      { id: 'south', name: '南越', description: '语流更顺，口感更自然。' }
    ],
    selectedDialect: 'north'
  },

  async onLoad() {
    const state = store.getState();
    this.setData({ selectedDialect: state.selectedDialect || 'north' });

    try {
      await syncCatalog();
      this.setData({
        dialects: ['north', 'south'].map((dialect) => {
          const meta = store.getDialectMeta(dialect);
          return {
            id: dialect,
            name: meta.name,
            description: meta.description
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

  onUnload() {
    if (this.audio) this.audio.destroy();
  }
});
