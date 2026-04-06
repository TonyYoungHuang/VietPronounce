const store = require('../../utils/store');

Page({
  data: {
    trial: null,
    dialectLabel: '北越'
  },

  onShow() {
    const trial = store.getTrialResult();
    if (!trial || !trial.result) return;
    const dialectLabel = trial.dialect === 'south' ? '南越' : '北越';
    const segments = (trial.result.segments || []).map((segment, index) => ({
      text: segment.text,
      tip: segment.tip,
      active: (trial.result.issueIndices || []).includes(index)
    }));
    this.setData({ trial: { ...trial.result, segments }, dialectLabel });
  },

  playDemo() {
    if (!this.audio) this.audio = wx.createInnerAudioContext();
    this.audio.src = this.data.trial.demoAudio;
    this.audio.play();
  },

  playRecord() {
    if (!this.data.trial.recordAudio) {
      wx.showToast({ title: '没有录音可播放', icon: 'none' });
      return;
    }
    if (!this.recordAudio) this.recordAudio = wx.createInnerAudioContext();
    this.recordAudio.src = this.data.trial.recordAudio;
    this.recordAudio.play();
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=trial-result' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index?next=/pages/home/index' });
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
});
