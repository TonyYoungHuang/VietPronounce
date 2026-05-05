const store = require('../../utils/store');
const { getDemoAudioUrl } = require('../../services/demo-audio');
const { scoreFixedContent } = require('../../services/score');
const appApi = require('../../services/app-api');
const { syncCatalog } = require('../../services/content-sync');
const { validateRecordingQuality } = require('../../utils/audio-quality');
const { prepareGuidedSegments } = require('../../utils/content-audio');
const { ensureServiceReadyForScoring } = require('../../utils/startup-check');
const { getOfflineNotice, markUsingCache } = require('../../utils/network-status');
const { enqueueSyncTask } = require('../../utils/sync-queue');
const {
  agreePrivacyAuthorization,
  openPrivacyContract,
  rejectPrivacyAuthorization,
  requestRecordPermission
} = require('../../utils/record-permission');
const { attachShare } = require('../../utils/share');

function findPracticeFrame(dialect, item) {
  const dialectMeta = store.getDialectMeta(dialect);
  for (const level of dialectMeta.levels) {
    for (const lesson of level.lessons) {
      const index = lesson.items.findIndex((entry) => entry.id === item.id);
      if (index > -1) {
        const progressPercent = lesson.items.length ? Math.round(((index + 1) / lesson.items.length) * 100) : 0;
        return {
          progressLabel: `${level.name} · 第 ${index + 1}/${lesson.items.length} 条`,
          progressPercent,
          lessonId: lesson.id,
          levelId: level.id
        };
      }
    }
  }
  return { progressLabel: '当前练习', progressPercent: 0, lessonId: item.lessonId || '', levelId: item.levelId || 'beginner' };
}

Page(attachShare({
  data: {
    dialect: 'north',
    dialectLabel: '亚洲语种',
    item: null,
    hasRecording: false,
    recording: false,
    recordingDuration: 0,
    tempFilePath: '',
    loading: false,
    lastScore: 0,
    progressPercent: 0,
    progressLabel: '',
    levelId: 'beginner',
    guideText: '',
    guidedSegments: [],
    activeSegmentIndex: 0,
    activeSegmentTip: '',
    offlineNotice: '',
    preflightText: '找一个安静环境，手机距离嘴部约 15-20 厘米。',
    countdown: 0,
    volumeBars: [18, 30, 22, 36, 24],
    recordingHint: '按住录音，松开结束',
    privacyVisible: false,
    privacyName: '用户隐私保护指引'
  },

  async onLoad(query) {
    const dialect = (query && query.dialect) || store.getState().selectedDialect || 'north';
    if (!store.isDialectUnlocked(dialect)) {
      wx.showToast({ title: '请先开通完整版', icon: 'none' });
      setTimeout(() => wx.navigateTo({ url: '/pages/landing/index' }), 300);
      return;
    }

    try {
      await syncCatalog();
    } catch (error) {}

    const context = store.createPracticeAttempt(dialect, query.itemId);
    if (!context.item) {
      wx.showToast({ title: '练习内容不存在', icon: 'none' });
      return;
    }

    this.practiceContext = context;
    const frame = findPracticeFrame(dialect, context.item);
    const guidedSegments = prepareGuidedSegments(context.item);
    this.setData({
      dialect,
      dialectLabel: store.getDialectLabel(dialect),
      item: context.item,
      lastScore: context.previous ? context.previous.total : 0,
      progressPercent: frame.progressPercent,
      progressLabel: frame.progressLabel,
      levelId: frame.levelId,
      guideText: context.item.hint || '先听标准音，再开始跟读。',
      guidedSegments,
      activeSegmentIndex: 0,
      activeSegmentTip: guidedSegments[0] ? guidedSegments[0].tip : '',
      offlineNotice: getOfflineNotice()
    });

    this.recorderManager = wx.getRecorderManager();
    this.audio = wx.createInnerAudioContext();
    this.recordAudio = wx.createInnerAudioContext();
    this.recorderManager.onStop((res) => {
      this.recordTouchActive = false;
      this.stopRecordingBars();
      this.setData({
        recording: false,
        hasRecording: true,
        tempFilePath: res.tempFilePath,
        recordingDuration: res.duration || 2000
      });
      wx.showToast({ title: '录音完成', icon: 'none' });
    });
    this.recorderManager.onError(() => {
      this.recordTouchActive = false;
      this.stopRecordingBars();
      this.setData({ recording: false, recordingHint: '录音中断，请重新按住录音' });
      wx.showToast({ title: '录音中断，请重试', icon: 'none' });
    });
  },

  playDemo() {
    this.playAudioSource(this.data.item.demoAudio, this.data.item.fallbackDemoAudio, { rate: 1, mode: 'normal', text: this.data.item.text });
  },

  playSlowDemo() {
    this.playAudioSource(this.data.item.slowDemoAudio || this.data.item.demoAudio, this.data.item.fallbackDemoAudio || this.data.item.demoAudio, { rate: 0.78, mode: 'slow', text: this.data.item.text });
  },

  playSegment(event) {
    const index = Number(event.currentTarget.dataset.index || 0);
    const segment = this.data.guidedSegments[index];
    if (!segment) return;
    this.setData({ activeSegmentIndex: index, activeSegmentTip: segment.tip });
    this.playAudioSource(segment.demoAudio, segment.fallbackDemoAudio || this.data.item.fallbackDemoAudio || this.data.item.demoAudio, { rate: 1, mode: 'normal', text: segment.text });
  },

  playSlowSegment(event) {
    const index = Number(event.currentTarget.dataset.index || 0);
    const segment = this.data.guidedSegments[index];
    if (!segment) return;
    this.setData({ activeSegmentIndex: index, activeSegmentTip: segment.tip });
    this.playAudioSource(segment.slowDemoAudio || segment.demoAudio, segment.fallbackDemoAudio || this.data.item.fallbackDemoAudio || this.data.item.demoAudio, { rate: 0.78, mode: 'slow', text: segment.text });
  },

  playAudioSource(primary, fallback, options = {}) {
    if (!this.audio) return;
    const generatedSource = options.text ? getDemoAudioUrl({
      text: options.text,
      dialect: this.data.dialect,
      mode: options.mode
    }) : '';
    const source = generatedSource || primary || fallback;
    if (!source) {
      wx.showToast({ title: '范读音频待补充', icon: 'none' });
      return;
    }

    if (this.audio.offError && this.audioErrorHandler) {
      this.audio.offError(this.audioErrorHandler);
    }

    const fallbackSource = generatedSource ? '' : (primary && primary !== source ? primary : (fallback && fallback !== source ? fallback : ''));
    this.audioErrorHandler = () => {
      if (fallbackSource) {
        this.audio.src = fallbackSource;
        try {
          this.audio.playbackRate = options.rate || 1;
        } catch (error) {}
        this.audio.play();
        wx.showToast({ title: '使用临时范读音频', icon: 'none' });
        return;
      }
      wx.showToast({ title: '范读音频待补充', icon: 'none' });
    };

    if (this.audio.onError) {
      this.audio.onError(this.audioErrorHandler);
    }
    this.audio.stop();
    try {
      this.audio.playbackRate = options.rate || 1;
    } catch (error) {}
    this.audio.src = source;
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

  async ensureRecordPermission(callback) {
    const allowed = await requestRecordPermission(this);
    if (allowed) {
      callback();
      return;
    }
    this.recordTouchActive = false;
    this.setData({ recordingHint: '请先开启麦克风权限，再长按录音' });
  },

  agreePrivacyAuthorization() {
    agreePrivacyAuthorization(this);
  },

  rejectPrivacyAuthorization() {
    rejectPrivacyAuthorization(this);
  },

  openPrivacyContract() {
    openPrivacyContract();
  },

  animateRecordingBars() {
    this.stopRecordingBars();
    this.waveTimer = setInterval(() => {
      const bars = [0, 1, 2, 3, 4].map((_, index) => 18 + Math.round(Math.random() * 34) + (index % 2 ? 8 : 0));
      this.setData({ volumeBars: bars });
    }, 180);
  },

  stopRecordingBars() {
    if (this.waveTimer) {
      clearInterval(this.waveTimer);
      this.waveTimer = null;
    }
  },

  beginRecorder() {
    if (this.data.recording) return;
    this.recorderManager.start({
      duration: 12000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    });
    this.animateRecordingBars();
    this.setData({ recording: true, countdown: 0, recordingHint: '正在录音，保持音量稳定' });
  },

  async startHoldRecord() {
    this.recordTouchActive = true;
    this.setData({ recordingHint: '正在准备录音，请按住不放' });
    const directReady = await ensureServiceReadyForScoring();
    if (!directReady.ok) {
      this.recordTouchActive = false;
      wx.showToast({ title: directReady.message, icon: 'none' });
      return;
    }
    this.ensureRecordPermission(() => {
      if (!this.recordTouchActive || this.data.recording) return;
      this.beginRecorder();
    });
    return;

    const ready = await ensureServiceReadyForScoring();
    if (!ready.ok) {
      wx.showToast({ title: ready.message, icon: 'none' });
      return;
    }
    this.ensureRecordPermission(() => {
      if (this.data.recording || this.countdownTimer) return;
      this.setData({ countdown: 3, recordingHint: '倒计时后开始录音' });
      this.countdownTimer = setInterval(() => {
        const next = this.data.countdown - 1;
        if (next <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.beginRecorder();
          return;
        }
        this.setData({ countdown: next });
      }, 650);
    });
  },

  stopHoldRecord() {
    this.recordTouchActive = false;
    if (!this.data.recording) {
      this.setData({ recordingHint: '按住录音，松开结束' });
      return;
    }
    this.recorderManager.stop();
    this.stopRecordingBars();
    return;

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.setData({ countdown: 0, recordingHint: '准备好后长按开始跟读' });
      return;
    }
    if (this.data.recording) {
      this.recorderManager.stop();
      this.stopRecordingBars();
    }
  },

  async startHoldRecord() {
    this.recordTouchActive = true;
    this.setData({ recordingHint: '正在准备录音，请按住不放' });
    const ready = await ensureServiceReadyForScoring();
    if (!ready.ok) {
      this.recordTouchActive = false;
      wx.showToast({ title: ready.message, icon: 'none' });
      return;
    }
    this.ensureRecordPermission(() => {
      if (!this.recordTouchActive || this.data.recording) return;
      this.beginRecorder();
    });
  },

  stopHoldRecord() {
    this.recordTouchActive = false;
    if (!this.data.recording) {
      this.setData({ recordingHint: '按住录音，松开结束' });
      return;
    }
    this.recorderManager.stop();
    this.stopRecordingBars();
  },

  showRecordHint() {
    wx.showToast({ title: this.data.recording ? '松开即可结束录音' : '长按开始录音', icon: 'none' });
  },

  resetRecord() {
    this.setData({ hasRecording: false, tempFilePath: '', recordingDuration: 0, recording: false });
  },

  async submitPractice() {
    if (!this.data.hasRecording) {
      wx.showToast({ title: '请先录音', icon: 'none' });
      return;
    }

    const ready = await ensureServiceReadyForScoring();
    if (!ready.ok) {
      wx.showToast({ title: ready.message, icon: 'none' });
      return;
    }

    try {
      const quality = await validateRecordingQuality({
        filePath: this.data.tempFilePath,
        durationMs: this.data.recordingDuration
      }, this.data.item);
      if (!quality.ok) {
        wx.showToast({ title: quality.message, icon: 'none' });
        return;
      }
    } catch (error) {
      wx.showToast({ title: '无法读取录音文件，请重新录制。', icon: 'none' });
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
          markUsingCache('进度已进入待同步队列，恢复连接后会自动同步。');
          enqueueSyncTask('progressScore', {
            userId,
            dialect: this.data.dialect,
            itemId: this.data.item.id,
            score: persisted
          });
          wx.showToast({ title: '进度已保存，恢复连接后自动同步', icon: 'none' });
        }
      }

      this.setData({ loading: false });
      wx.navigateTo({ url: '/pages/result/index' });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '评分失败，请稍后再试', icon: 'none' });
    }
  },

  closePage() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: `/pages/lesson/index?levelId=${this.data.levelId}` }) });
  },

  openLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?levelId=${this.data.levelId}` });
  },

  stopRecordingIfNeeded() {
    this.recordTouchActive = false;
    if (this.data.recording && this.recorderManager) {
      this.recorderManager.stop();
    }
    this.stopRecordingBars();
  },

  onHide() {
    this.stopRecordingIfNeeded();
  },

  onUnload() {
    this.stopRecordingIfNeeded();
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.stopRecordingBars();
    if (this.audio) this.audio.destroy();
    if (this.recordAudio) this.recordAudio.destroy();
  }
}, { path: '/pages/landing/index?from=share' }));
