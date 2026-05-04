const store = require('../../utils/store');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    trial: null,
    dialectLabel: '北越',
    moodTitle: '',
    moodSub: '',
    issueTips: [],
    pronunciationDimensions: [],
    selectedSegmentTip: '',
    selectedSegmentText: ''
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
    const issueTips = segments.filter((segment) => segment.active).map((segment) => segment.tip);
    this.setData({
      trial: { ...trial.result, segments, dialect: trial.dialect },
      dialectLabel,
      issueTips,
      pronunciationDimensions: trial.result.pronunciationDimensions || [],
      selectedSegmentTip: issueTips[0] || '点击上方分段，可以查看对应的纠音提示。',
      selectedSegmentText: segments.find((segment) => segment.active)?.text || '',
      moodTitle: trial.result.passed ? '这条已经很接近标准音了' : '已找到值得继续打磨的位置',
      moodSub: trial.result.passed ? '现在你已经体验到系统如何给出可执行反馈。' : '这就是完整课程里每天都会给你的纠音方式。'
    });
  },

  selectSegment(event) {
    const { tip, text } = event.currentTarget.dataset;
    this.setData({
      selectedSegmentTip: tip || '这个分段暂时没有单独提示，保持声调、口型和节奏稳定。',
      selectedSegmentText: text || ''
    });
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

  goRedeem() {
    wx.navigateTo({ url: '/pages/redeem/index' });
  },

  retryTrial() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: `/pages/trial/index?dialect=${this.data.trial.dialect || 'north'}` }) });
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
}, { path: '/pages/landing/index?from=share' }));
