const store = require('../../utils/store');
const { scoreFixedContent } = require('../../services/score');
const { syncTrial } = require('../../services/content-sync');

Page({
  data: {
    dialect: 'north',
    item: null,
    hasRecording: false,
    recording: false,
    recordingDuration: 0,
    tempFilePath: '',
    scoreLoading: false
  },

  async onLoad(query) {
    const dialect = query.dialect || store.getState().selectedDialect || 'north';
    try {
      await syncTrial(dialect);
    } catch (error) {
      // keep local fallback
    }

    const context = store.createTrialAttempt(dialect);
    this.trialContext = context;
    store.setSelectedDialect(dialect);
    this.setData({ dialect, item: context.item });

    this.recorderManager = wx.getRecorderManager();
    this.audio = wx.createInnerAudioContext();
    this.recordAudio = wx.createInnerAudioContext();
    this.recorderManager.onStop((res) => {
      this.setData({
        hasRecording: true,
        recording: false,
        tempFilePath: res.tempFilePath,
        recordingDuration: res.duration || 1800
      });
      wx.showToast({ title: '录音完成', icon: 'none' });
    });
  },

  playDemo() {
    this.audio.src = this.data.item.demoAudio;
    this.audio.play();
  },

  toggleRecording() {
    if (this.data.recording) {
      this.recorderManager.stop();
      return;
    }
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        this.recorderManager.start({ duration: 10000, format: 'mp3' });
        this.setData({ recording: true });
      },
      fail: () => wx.showToast({ title: '请先授权麦克风', icon: 'none' })
    });
  },

  replayRecord() {
    if (!this.data.tempFilePath) {
      wx.showToast({ title: '请先完成一段录音', icon: 'none' });
      return;
    }
    this.recordAudio.src = this.data.tempFilePath;
    this.recordAudio.play();
  },

  resetRecord() {
    this.setData({ hasRecording: false, tempFilePath: '', recordingDuration: 0 });
  },

  async submitTrial() {
    if (!this.data.hasRecording) {
      wx.showToast({ title: '请先录音再提交', icon: 'none' });
      return;
    }

    this.setData({ scoreLoading: true });
    try {
      const score = await scoreFixedContent(this.trialContext, {
        audioFilePath: this.data.tempFilePath,
        durationMs: this.data.recordingDuration || 2000
      });
      store.persistTrialScore(this.data.dialect, this.trialContext, {
        ...score,
        recordAudio: this.data.tempFilePath
      });
      this.setData({ scoreLoading: false });
      wx.navigateTo({ url: '/pages/trial-result/index' });
    } catch (error) {
      this.setData({ scoreLoading: false });
      wx.showToast({ title: error.message || '评分失败，请稍后再试', icon: 'none' });
    }
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
});
