const store = require('../../utils/store');
const { attachShare } = require('../../utils/share');

function getProgressDeltaText(result) {
  const delta = Number(result.scoreDelta || 0);
  if (delta > 0) return `比上次提高 ${delta} 分`;
  if (delta < 0) return `比上次低 ${Math.abs(delta)} 分`;
  return result.previousScore === null || result.previousScore === undefined ? '首次完成本题评分' : '与上次持平';
}

function getFocusSegment(segments) {
  return segments.find((segment) => segment.active) || segments[0] || null;
}

function getFocusDimension(dimensions) {
  return (dimensions || []).slice().sort((left, right) => Number(left.score || 0) - Number(right.score || 0))[0] || null;
}

Page(attachShare({
  data: {
    result: null,
    moodTitle: '',
    moodSub: '',
    issueTips: [],
    nextItemId: '',
    metrics: [],
    pronunciationDimensions: [],
    selectedSegmentTip: '',
    selectedSegmentText: '',
    progressDeltaText: '',
    attemptHistory: [],
    focusSegment: null,
    focusDimension: null,
    nextTargetScore: 82,
    repeatPlan: []
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
    const issueTips = segments.filter((segment) => segment.active).map((segment) => segment.tip);
    const dialect = result.dialect || store.getState().selectedDialect;
    const nextItemId = store.getNextItemId(dialect, result.itemId);
    const score = result.total || result.score || 0;
    const pronunciationDimensions = result.pronunciationDimensions || [];
    const focusSegment = getFocusSegment(segments);
    const focusDimension = getFocusDimension(pronunciationDimensions);
    const nextTargetScore = Math.min(95, Math.max(82, Number(score) + (score >= 82 ? 3 : 5)));

    this.setData({
      result: { ...result, total: score, segments },
      issueTips,
      nextItemId,
      pronunciationDimensions,
      attemptHistory: (result.attempts || []).map((attempt, index) => ({
        ...attempt,
        label: index === 0 ? '本次' : `前 ${index} 次`
      })),
      selectedSegmentTip: issueTips[0] || '点击上方分段，可以查看对应的纠音提示。',
      selectedSegmentText: focusSegment && focusSegment.active ? focusSegment.text : '',
      progressDeltaText: getProgressDeltaText(result),
      focusSegment,
      focusDimension,
      nextTargetScore,
      repeatPlan: [
        { label: '第 1 遍', text: '只听慢速范读，确认声调走势。' },
        { label: '第 2 遍', text: '跟读最薄弱分段，注意口型和尾音。' },
        { label: '第 3 遍', text: `整句录音，目标 ${nextTargetScore} 分。` }
      ],
      metrics: [
        { label: '准确度', value: result.accuracy || 0, tone: 'green', symbol: '✓' },
        { label: '流利度', value: result.fluency || 0, tone: 'warm', symbol: '≈' },
        { label: '完整度', value: result.completeness || 0, tone: 'green', symbol: '◎' }
      ],
      moodTitle: result.passed ? '太棒了，发音很自然' : (result.accuracy >= 80 ? '很接近了，再抓准关键音' : '已定位最需要修正的位置'),
      moodSub: result.passed ? 'Your pronunciation is exceptionally natural.' : `本次锁定 ${issueTips.length || 1} 个重点纠音提醒。`
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
    this.audio.src = this.data.result.demoAudio || this.data.result.fallbackDemoAudio || '/assets/audio/north-demo.wav';
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

  retryDimension(event) {
    const focus = event.currentTarget.dataset.focus || '';
    wx.navigateTo({ url: `/pages/practice/index?itemId=${this.data.result.itemId}&focus=${focus}` });
  },

  backLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?levelId=${this.data.result.levelId}` });
  },

  nextItem() {
    if (!this.data.nextItemId) {
      wx.showToast({ title: '已经到当前内容末尾，先返回章节列表。', icon: 'none' });
      this.backLesson();
      return;
    }
    wx.navigateTo({ url: `/pages/practice/index?itemId=${this.data.nextItemId}` });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },

  onUnload() {
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
}, { path: '/pages/landing/index?from=share' }));
