const store = require('../../utils/store');

Page({
  data: {
    result: null
  },

  onShow() {
    const latest = store.getLatestPracticeResult();
    const trial = store.getTrialResult();
    let result = latest || (trial && trial.result);
    if (result && trial && trial.result && trial.result.itemId === result.itemId) {
      result = {
        ...result,
        demoAudio: trial.result.demoAudio || result.demoAudio,
        recordAudio: trial.result.recordAudio || result.recordAudio
      };
    }
    if (!result) return;
    const segments = (result.segments || []).map((segment, index) => ({
      text: segment.text,
      tip: segment.tip,
      active: (result.issueIndices || []).includes(index)
    }));
    this.setData({ result: { ...result, segments } });
  },

  playDemo() {
    if (!this.audio) this.audio = wx.createInnerAudioContext();
    this.audio.src = this.data.result.demoAudio || '/assets/audio/north-demo.wav';
    this.audio.play();
  },

  playRecord() {
    if (!this.data.result.recordAudio) {
      wx.showToast({ title: '当前没有录音可播放', icon: 'none' });
      return;
    }
    if (!this.recordAudio) this.recordAudio = wx.createInnerAudioContext();
    this.recordAudio.src = this.data.result.recordAudio;
    this.recordAudio.play();
  },

  retry() {
    wx.navigateTo({ url: `/pages/practice/index?itemId=${this.data.result.itemId}` });
  },

  backLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?levelId=${this.data.result.levelId}` });
  },

  nextItem() {
    wx.showToast({ title: '下一条可在章节列表中继续查看', icon: 'none' });
    this.backLesson();
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
});
