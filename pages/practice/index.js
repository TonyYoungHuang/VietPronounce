const store = require('../../utils/store');
const { scoreFixedContent } = require('../../services/score');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');

Page({
  data: {
    dialect: 'north',
    dialectLabel: '北越',
    item: null,
    hasRecording: false,
    recording: false,
    recordingDuration: 0,
    tempFilePath: '',
    loading: false,
    lastScore: 0
  },

  async onLoad(query) {
    if (!store.isUnlocked()) {
      wx.showToast({ title: '请先开通完整版', icon: 'none' });
      setTimeout(() => wx.navigateTo({ url: '/pages/contact/index?from=practice-gate' }), 300);
      return;
    }

    try {
      await syncCatalog();
    } catch (error) {
      // keep local fallback
    }

    const dialect = store.getState().selectedDialect;
    const context = store.createPracticeAttempt(dialect, query.itemId);
    if (!context.item) {
      wx.showToast({ title: '练习内容不存在', icon: 'none' });
      return;
    }

    this.practiceContext = context;
    this.setData({
      dialect,
      dialectLabel: dialect === 'south' ? '南越' : '北越',
      item: context.item,
      lastScore: context.previous ? context.previous.total : 0
    });

    this.recorderManager = wx.getRecorderManager();
    this.audio = wx.createInnerAudioContext();
    this.recordAudio = wx.createInnerAudioContext();
    this.recorderManager.onStop((res) => {
      this.setData({
        recording: false,
        hasRecording: true,
        tempFilePath: res.tempFilePath,
        recordingDuration: res.duration || 2000
      });
      wx.showToast({ title: '录音完成', icon: 'none' });
    });
  },

  playDemo() {
    this.audio.src = this.data.item.demoAudio;
    this.audio.play();
  },

  replayRecord() {
    if (!this.data.tempFilePath) {
      wx.showToast({ title: '请先录音', icon: 'none' });
      return;
    }
    this.recordAudio.src = this.data.tempFilePath;
    this.recordAudio.play();
  },

  toggleRecording() {
    if (this.data.recording) {
      this.recorderManager.stop();
      return;
    }
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        this.recorderManager.start({ duration: 12000, format: 'mp3' });
        this.setData({ recording: true });
      },
      fail: () => wx.showToast({ title: '请先授权录音权限', icon: 'none' })
    });
  },

  resetRecord() {
    this.setData({ hasRecording: false, tempFilePath: '', recordingDuration: 0 });
  },

  async submitPractice() {
    if (!this.data.hasRecording) {
      wx.showToast({ title: '请先录音', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const score = await scoreFixedContent(this.practiceContext, {
        audioFilePath: this.data.tempFilePath,
        durationMs: this.data.recordingDuration || 2000
      });

      const persisted = store.persistPracticeScore(this.data.dialect, this.practiceContext, {
        ...score,
        recordAudio: this.data.tempFilePath
      });

      const userId = store.getUserId();
      if (userId) {
        try {
          const remoteUser = await appApi.saveProgressScore(userId, this.data.dialect, this.data.item.id, persisted);
          store.hydrateFromRemoteUser(remoteUser);
        } catch (error) {
          wx.showToast({ title: '进度同步失败，已保存在本机', icon: 'none' });
        }
      }

      this.setData({ loading: false });
      wx.navigateTo({ url: '/pages/result/index' });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '评分失败，请稍后再试', icon: 'none' });
    }
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
});
